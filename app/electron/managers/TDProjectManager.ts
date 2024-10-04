import log from 'electron-log/main';
import { ProjectManager } from './interfaces/ProjectManager';
import { Version } from '../models/Version';
import fs from 'fs-extra';
import { Processor } from '../processors/interfaces/Processor';
import path from 'node:path';
import { Tracker } from '../trackers/interfaces/Tracker';
import { ChangeSet } from '../models/ChangeSet';
import { TDNode } from '../models/TDNode';
import { extractNodeNameFromToc, findContainers, findFileByExt, getNodeInfo, extractNodeNameFromDiffLine, getNodeInfoFromContent } from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import hidefile from 'hidefile';
import { PropertyRule } from '../models/Rule';
import { TDState } from '../models/TDState';

export class TDProjectManager implements ProjectManager<TDNode, TDState> {
  readonly processor: Processor;
  readonly hiddenDir: string;
  readonly tracker: Tracker;
  private versionNameMax = 256;
  private descriptionMax = 1024;
  private rules: PropertyRule[] = [];

  constructor(processor: Processor, tracker: Tracker, hiddenDir: string) {
    this.processor = processor;
    this.hiddenDir = hiddenDir;
    this.tracker = tracker;
    this.buildRules();
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

  async getVersionState(dir: string, versionId?: string): Promise<TDState> {
    await this.validateDirectory(dir);
    const hiddenDirPath = this.hiddenDirPath(dir);

    const tocFile = findFileByExt('toc', hiddenDirPath);
    if (!tocFile) {
      return Promise.reject(new MissingFileError('Could not find toc file'));
    }

    const toeDir = findFileByExt('dir', hiddenDirPath);
    if (!toeDir) {
      return Promise.reject(new MissingFileError('Could not find dir'));
    }

    const toeDirAbsPath = path.join(hiddenDirPath, toeDir);
    const containers = await findContainers(toeDirAbsPath);
    const container = containers[0];

    const tocContent = await this.tracker.readFile(hiddenDirPath, tocFile, versionId);
    const nodeNames: string[] = [];
    const state = new TDState();

    tocContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();

      const nodeName = extractNodeNameFromToc(container, trimmedLine);
      if (nodeName && !nodeNames.includes(nodeName)) {
        nodeNames.push(nodeName);
      }
    });

    

    for (const nodeName of nodeNames) {
      const nodeFilePath = path.posix.join(toeDir, container, `${nodeName}.n`);
      try {
        const nodeContent = await this.tracker.readFile(hiddenDirPath, nodeFilePath, versionId);
        const properties: Map<string, string> = new Map();

        nodeContent.split('\n').forEach(line => {
          this.parseProperty(line, properties); // TODO: solo usar la regla de tile.
        });
        const res = getNodeInfoFromContent(nodeContent);

        if (res) {
          const [type, subtype] = res;
          const node = new TDNode(nodeName, type, subtype, properties);
          state.nodes.push(node);

          // TO DO: generalizar mejor esto que es un asco
          if (type === 'TOP') {
            const connections = this.parseConnectionsTOP(nodeContent);
            if (connections.length > 0) {
              state.inputs.set(node.name, this.parseConnectionsTOP(nodeContent));
            } else {
              // TO DO: al final esto no es de un chop sino de un top
              const nodeFilePath = path.posix.join(toeDir, container, `${nodeName}.parm`);
              const nodeContent = await this.tracker.readFile(hiddenDirPath, nodeFilePath, versionId);
              const connections = this.parseConnectionsCHOP(nodeContent);
              if (connections.length > 0) {
                state.inputs.set(node.name, this.parseConnectionsCHOP(nodeContent));
              }
            }
          } else if (type === 'CHOP') {

            const connections = this.parseConnectionsTOP(nodeContent);
            if (connections.length > 0) {
              state.inputs.set(node.name, this.parseConnectionsTOP(nodeContent));
            } else {
              const nodeFilePath = path.posix.join(toeDir, container, `${nodeName}.parm`);
              const nodeContent = await this.tracker.readFile(hiddenDirPath, nodeFilePath, versionId);
              const connections = this.parseConnectionsCHOP(nodeContent);
              if (connections.length > 0) {
                state.inputs.set(node.name, this.parseConnectionsCHOP(nodeContent));
              }
            }
          } else if (type === 'COMP') {
            const nodeFilePath = path.posix.join(toeDir, container, `${nodeName}.network`);
            const nodeContent = await this.tracker.readFile(hiddenDirPath, nodeFilePath, versionId);
            const connections = this.parseConnectionsCOMP(nodeContent);
            if (connections.length > 0) {
              state.inputs.set(node.name, this.parseConnectionsCOMP(nodeContent));
            }
          }

        } else {
          state.nodes.push(new TDNode(nodeName, undefined, undefined, properties));
        }

      } catch (error) {
        log.error(`Could not parse information for node ${nodeName} due toe ${error}. Continuing...`);
      }
    }

    return Promise.resolve(state);
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
          this.parseProperty(trimmedLine.substring(1).trim(), nodeProperties);
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

  private parseProperty(line: string, nodeProperties: Map<string, string>): void {
    for (const rule of this.rules) {
      if (rule.match(line)) {
        rule.extract(line, nodeProperties);
        return;
      }
    }
  }

  private parseConnectionsTOP(content: string): string[] {
    const inputsSection = content.match(/inputs\s*\{([^}]*)\}/);
    if (!inputsSection) {
      return [];
    }

    return inputsSection[1].trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const parts = line.split(/\s+/);
        return parts[1];
      });
  }

  private parseConnectionsCHOP(content: string): string[] {
    const chopLine = content.split('\n').find(line => line.trim().startsWith('chop'));

    if (!chopLine) {
      return [];
    }

    const parts = chopLine.trim().split(/\s+/);
    return parts.length >= 3 ? [parts[2]] : [];
  }

  private parseConnectionsCOMP(content: string): string[] {
    const compInputsSection = content.match(/compinputs\s*\{([^}]*)\}/);
    if (!compInputsSection) {
      return [];
    }

    return compInputsSection[1].trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && /^\d/.test(line))
      .map(line => {
        const parts = line.split(/\s+/);
        return parts[1];
      });
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

  private buildRules(): void {
    this.rules = [
      /*----------------------IGNORE RULES-------------------*/
      new PropertyRule(
        '[IGNORE] flags',
        'ignore flags property',
        (line: string) => line.startsWith('flags'),
        () => { /* No action for ignored properties */ }
      ),
      new PropertyRule(
        '[IGNORE] view',
        'ignore view property',
        (line: string) => line.startsWith('view'),
        () => { /* No action for ignored properties */ }
      ),
      new PropertyRule(
        '[IGNORE] pageindex',
        'ignore pageindex property',
        (line: string) => line.startsWith('pageindex'),
        () => { /* No action for ignored properties */ }
      ),
      /*-----------------------------------------------------*/

      /*---------------------KNOWN PROPERTIES----------------*/
      new PropertyRule(
        'tile',
        'tile property, format: tile <tileX> <tileY> <sizeX> <sizeY>',
        (line: string) => line.startsWith('tile'),
        (line: string, nodeProperties: Map<string, string>) => {
          const parts = line.split(' ').slice(1);
          if (parts.length === 4) {
            nodeProperties.set('tileX', parts[0].trim());
            nodeProperties.set('tileY', parts[1].trim());
            nodeProperties.set('sizeX', parts[2].trim());
            nodeProperties.set('sizeY', parts[3].trim());
          }
        }
      ),
      /*-----------------------------------------------------*/

      /*-----------------------DEFAULT-----------------------*/
      new PropertyRule(
        'default',
        'default property, format: <propertyName> <???> <value>',
        (line: string) => line.split(' ').length >= 3,
        (line: string, nodeProperties: Map<string, string>) => {
          const parts = line.split(' ');
          nodeProperties.set(parts[0].trim(), parts[2].trim());
        }
      )
      /*-----------------------------------------------------*/
    ];
  }
}
