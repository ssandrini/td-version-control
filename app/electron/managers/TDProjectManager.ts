import log from 'electron-log/main';
import { ProjectManager } from './interfaces/ProjectManager';
import { Version } from '../models/Version';
import fs from 'fs-extra';
import { Processor } from '../processors/interfaces/Processor';
import path from 'node:path';
import { Tracker } from '../trackers/interfaces/Tracker';
import { ChangeSet } from '../models/ChangeSet';
import { TDNode } from '../models/TDNode';
import { extractNodeName, findContainers, findFileByExt, getNodeInfo } from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import hidefile from 'hidefile';

export class TDProjectManager implements ProjectManager {
  readonly processor: Processor;
  readonly hiddenDir: string;
  readonly tracker: Tracker;
  private versionNameMax = 256;
  private descriptionMax = 1024;

  constructor(processor: Processor, tracker: Tracker, hiddenDir: string) {
    this.processor = processor;
    this.hiddenDir = hiddenDir;
    this.tracker = tracker;
  }

  private hiddenDirPath = (dir: string): string => {
    return path.join(dir, this.hiddenDir);
  };

  async init(dir: string, src?: string): Promise<Version> {
    await this.validateDirectory(dir);

    if (src) {
      try {
        await this.validateDirectory(src);
        fs.copySync(src, dir, { recursive: true });
        log.info(`Copied ${src} into ${dir}`);
      } catch (error) {
        log.error(`Error copying ${src} into ${dir}. Cause:`, error);
        return Promise.reject(error);
      }
    }

    const hiddenDirPath = this.hiddenDirPath(dir);

    try {
      fs.mkdirSync(hiddenDirPath);
      hidefile.hideSync(hiddenDirPath);
    } catch (error) {
      log.error(`Error creating directory ${hiddenDirPath}. Cause:`, error);
      return Promise.reject(error);
    }

    let output;
    try {
      output = await this.processor.preprocess(dir, hiddenDirPath);
    } catch (error) {
      return Promise.reject(error);
    }
    log.info(`Created ${output} at ${hiddenDirPath}`);
    try {
      return await this.tracker.init(hiddenDirPath);
    } catch (error) {
      log.error(
        `Error initializing tracker at ${hiddenDirPath}. Cause:`,
        error
      );
      return Promise.reject(error);
    }
  }

  async currentVersion(dir: string): Promise<Version> {
    await this.validateDirectory(dir);
    return this.tracker.currentVersion(this.hiddenDirPath(dir));
  }

  async listVersions(dir: string): Promise<Version[]> {
    await this.validateDirectory(dir);
    return this.tracker.listVersions(this.hiddenDirPath(dir));
  }

  async createVersion(
    dir: string,
    versionName: string,
    description?: string
  ): Promise<Version> {
    if (versionName.length > this.versionNameMax || versionName.length == 0) {
      const msg = `Version name must be between 0 and ${this.versionNameMax}.`;
      log.error(msg);
      return Promise.reject(new RangeError(msg));
    }

    if (description && description.length > this.descriptionMax) {
      const msg = `Description must be between 0 and ${this.descriptionMax}.`;
      log.error(msg);
      return Promise.reject(new RangeError(msg));
    }

    await this.validateDirectory(dir);
    const hiddenDirPath = this.hiddenDirPath(dir);
    try {
      await this.processor.preprocess(dir, this.hiddenDir);
      const createdVersion = await this.tracker.createVersion(
        hiddenDirPath,
        versionName,
        description
      );
      return Promise.resolve(createdVersion);
    } catch (error) {
      log.error('Commit failed. Cause:', error);
      return Promise.reject(error);
    }
  }

  async goToVersion(dir: string, versionId: string): Promise<Version> {
    await this.validateDirectory(dir);
    return this.tracker.goToVersion(this.hiddenDirPath(dir), versionId);
  }

  async compare(dir: string, versionId?: string): Promise<ChangeSet<TDNode>> {
    log.debug("Starting compare...");
    await this.validateDirectory(dir);

    if (!versionId) {
      await this.processor.preprocess(dir, this.hiddenDir);
    }

    const managementDir = path.join(dir, this.hiddenDir);

    const tocFile = findFileByExt('toc', managementDir);
    if (!tocFile) {
      return Promise.reject(new MissingFileError('Could not find toc file'));
    }

    const toeDir = findFileByExt('dir', managementDir);
    if (!toeDir) {
      return Promise.reject(new MissingFileError('Could not find dir'));
    }
    const toeDirAbsPath = path.join(managementDir, toeDir);
    const containers = await findContainers(toeDirAbsPath);

    const tocDiff = (await this.tracker.compare(managementDir, versionId, tocFile)).split('\n');
    log.debug('Toc diff', tocDiff.join('\n'));

    const added = await Promise.all(
      tocDiff
        .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
        .map(async (line) => {
          const nodeName = extractNodeName(containers[0], line);
          const result = await getNodeInfo(toeDirAbsPath, containers[0], nodeName);
          if (result) {
            const [nodeType, nodeSubtype] = result;
            return new TDNode(nodeName, nodeType, nodeSubtype);
          }
          return new TDNode(nodeName, undefined, undefined);
        })
    );

    const deleted = await Promise.all(
      tocDiff
        .filter((line) => line.startsWith('-') && !line.startsWith('---'))
        .map(async (line) => {
          const nodeName = extractNodeName(containers[0], line);
          const result = await getNodeInfo(toeDirAbsPath, containers[0], nodeName);
          if (result) {
            const [nodeType, nodeSubtype] = result;
            return new TDNode(nodeName, nodeType, nodeSubtype);
          }
          return new TDNode(nodeName, undefined, undefined);
        })
    );

    const modifiedDiff = (await this.tracker.compare(managementDir, versionId, undefined, true)).split('\n');
    log.debug('Diff', modifiedDiff.join('\n'));
    const modified = await Promise.all(
      modifiedDiff
        .filter((line) => line.startsWith('diff --git'))
        .map(async (line) => {
          const nodeName = extractNodeName(containers[0], line);
          const result = await getNodeInfo(toeDirAbsPath, containers[0], nodeName);
          if (result) {
            const [nodeType, nodeSubtype] = result;
            return new TDNode(nodeName, nodeType, nodeSubtype);
          }
          return new TDNode(nodeName, undefined, undefined);
        })
    );

    return ChangeSet.fromValues(added, modified, deleted);
  }

  private async validateDirectory(dir: string): Promise<void> {
    try {
      const stats = await fs.promises.stat(dir);
      if (!stats.isDirectory()) {
        const msg = `The path ${dir} is not a directory.`;
        log.error(msg);
        return Promise.reject(new TypeError(msg));
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        const msg = `The path ${dir} does not exist.`;
        log.error(msg);
        return Promise.reject(new TypeError(msg));
      }
      log.error(`Error validating directory ${dir}. Cause:`, error);
      return Promise.reject(error);
    }
  }
}
