import log from 'electron-log/main';
import { ProjectManager } from './interfaces/ProjectManager';
import { Version } from '../models/Version';
import fs from 'fs-extra';
import { Processor } from '../processors/interfaces/Processor';
import path from 'node:path';
import { Tracker } from '../trackers/interfaces/Tracker';
import { ChangeSet } from '../models/ChangeSet';
import { TDNode } from '../models/TDNode';
import {
  extractNodeNameFromToc,
  findContainers,
  findFileByExt,
  getNodeInfo,
  extractNodeNameFromDiffLine,
  getNodeInfoFromNFile, validateDirectory
} from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import { TDState } from '../models/TDState';
import { TDError } from '../errors/TDError';
import { PropertyRuleEngine } from '../rules/properties/PropertyRuleEngine';
import hidefile from "hidefile"
import { InputRuleEngine } from "../rules/inputs/InputRuleEngine";
import { TDEdge } from '../models/TDEdge';

export class TDProjectManager implements ProjectManager<TDNode, TDState> {
  readonly processor: Processor;
  readonly hiddenDir: string;
  readonly tracker: Tracker;
  readonly propertyRuleEngine: PropertyRuleEngine;
  readonly inputRuleEngine: InputRuleEngine;
  private versionNameMax = 256;
  private descriptionMax = 1024;

  constructor(processor: Processor, tracker: Tracker, hiddenDir: string) {
    this.processor = processor;
    this.hiddenDir = hiddenDir;
    this.tracker = tracker;
    this.propertyRuleEngine = new PropertyRuleEngine();
    this.inputRuleEngine = new InputRuleEngine();
  }

  private hiddenDirPath = (dir: string): string => {
    return path.join(dir, this.hiddenDir);
  };

  async init(dir: string, src?: string): Promise<Version> {
    await validateDirectory(dir);

    if (src) {
      try {
        await validateDirectory(src);
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
    await validateDirectory(dir);
    return this.tracker.currentVersion(this.hiddenDirPath(dir));
  }

  async listVersions(dir: string): Promise<Version[]> {
    await validateDirectory(dir);
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

    await validateDirectory(dir);
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
    await validateDirectory(dir);
    return this.tracker.goToVersion(this.hiddenDirPath(dir), versionId);
  }

  async compare(dir: string, versionId?: string): Promise<ChangeSet<TDNode>> {
    log.debug("Starting compare...");
    await validateDirectory(dir);

    if (!versionId) {
      await this.processor.preprocess(dir, this.hiddenDir);
    }

    const managementDir = path.join(dir, this.hiddenDir);
    const tocFile = await this.findFileWithCheck(managementDir, 'toc');
    const toeDir = await this.findFileWithCheck(managementDir, 'dir');

    const toeDirAbsPath = path.join(managementDir, toeDir);
    const containers = await findContainers(toeDirAbsPath);

    const tocDiff = (await this.tracker.compare(managementDir, versionId, tocFile)).split('\n');

    const added = await Promise.all(
      tocDiff
        .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
        .map(async (line) => {
          const lineContent = line.slice(1).trim();
          const nodeName = extractNodeNameFromToc(containers[0], lineContent);
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
          const lineContent = line.slice(1).trim();
          const nodeName = extractNodeNameFromToc(containers[0], lineContent);
          const result = await getNodeInfo(toeDirAbsPath, containers[0], nodeName);
          if (result) {
            const [nodeType, nodeSubtype] = result;
            return new TDNode(nodeName, nodeType, nodeSubtype);
          }
          return new TDNode(nodeName, undefined, undefined);
        })
    );

    const modifiedDiff = (await this.tracker.compare(managementDir, versionId, undefined, true));
    const modified = await this.getModified(modifiedDiff, containers[0], toeDirAbsPath);

    return ChangeSet.fromValues(added, modified, deleted);
  }

  private async getModified(diff: string, container: string, toeDirAbsPath: string): Promise<TDNode[]> {
    const modifiedObjects = diff.split('diff --git');
    const modifiedNodes: TDNode[] = [];
    for (const obj of modifiedObjects) {
      const nodeName = extractNodeNameFromDiffLine(container, 'diff --git' + obj.split('\n')[0].trim())
      if (nodeName == "") {
        continue;
      }

      const nodeProperties = new Map<string, string>();
      for (const line of obj.split('\n')) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('+') && !trimmedLine.startsWith('+++')) {
          this.propertyRuleEngine.applyRules(trimmedLine.substring(1).trim(), nodeProperties);
        }
      }
      if (nodeProperties.size > 0) {
        const result = await getNodeInfo(toeDirAbsPath, container, nodeName);
        let tdNode;
        if (result) {
          const [nodeType, nodeSubtype] = result;
          tdNode = new TDNode(nodeName, nodeType, nodeSubtype, nodeProperties);
        } else {
          tdNode = new TDNode(nodeName, undefined, undefined, nodeProperties); // no debería pasar
        }
        modifiedNodes.push(tdNode);
      }
    }
    return Promise.resolve(modifiedNodes);
  }

  async getVersionState(dir: string, versionId?: string): Promise<TDState> {
    await validateDirectory(dir);
    const hiddenDirPath = this.hiddenDirPath(dir);

    const tocFile = await this.findFileWithCheck(hiddenDirPath, 'toc');
    const toeDir = await this.findFileWithCheck(hiddenDirPath, 'dir');
    const toeDirAbsPath = path.join(hiddenDirPath, toeDir);

    const containers = await findContainers(toeDirAbsPath);
    const container = containers[0];

    const tocContent = await this.tracker.readFile(hiddenDirPath, tocFile, versionId);
    const nodeNames = this.extractNodeNamesFromToc(tocContent, container);

    const state = new TDState();

    for (const nodeName of nodeNames) {
      try {
        const [node, nodeInputs] = await this.createNode(hiddenDirPath, toeDir, container, nodeName, versionId);
        state.nodes.push(node);
        state.inputs.set(node.name, nodeInputs);
      } catch (error) {
        log.error(`Could not parse information for node ${nodeName} due to ${error}.`);
        return Promise.reject(new TDError(`Error getting state from ${dir}`));
      }
    }

    return state;
  }

  private async createNode(hiddenDirPath: string, toeDir: string, container: string, nodeName: string, versionId?: string): Promise<[TDNode, TDEdge[]]> {
    const files = [
      { ext: 'n', required: true },
      { ext: 'parm', required: false },
      { ext: 'network', required: false },
    ];

    const filePaths = files.map(file => path.posix.join(toeDir, container, `${nodeName}.${file.ext}`));

    const fileContents = await Promise.all(filePaths.map(async (filePath, index) => {
      try {
        return await this.tracker.readFile(hiddenDirPath, filePath, versionId);
      } catch (error) {
        if (files[index].required) {
          return Promise.reject(new TDError(`Required file missing: ${files[index].ext} for node ${nodeName}`));
        }
        return '';
      }
    }));

    const properties = new Map<string, string>();
    fileContents.forEach(content => this.processProperties(content, properties));

    const [type, subtype] = getNodeInfoFromNFile(fileContents[0])!;
    const node = new TDNode(nodeName, type, subtype, properties);

    const nodeInputs: TDEdge[] = [];
    fileContents.forEach(content => nodeInputs.push(...this.inputRuleEngine.process(content)));

    return [node, nodeInputs];
  }

  private processProperties(content: string, properties: Map<string, string>) {
    content.split('\n').forEach(line => {
      this.propertyRuleEngine.applyRules(line, properties);
    });
  }



  private async findFileWithCheck(hiddenDirPath: string, extension: string): Promise<string> {
    const file = findFileByExt(extension, hiddenDirPath);
    if (!file) {
      return Promise.reject(new MissingFileError(`Could not find ${extension} file`));
    }
    return file;
  }

  private extractNodeNamesFromToc(tocContent: string, container: string): string[] {
    const nodeNames: string[] = [];
    tocContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      const nodeName = extractNodeNameFromToc(container, trimmedLine);
      if (nodeName && !nodeNames.includes(nodeName)) {
        nodeNames.push(nodeName);
      }
    });
    return nodeNames;
  }

}
