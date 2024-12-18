import log from 'electron-log/main.js';
import { ProjectManager } from './interfaces/ProjectManager';
import { Version } from '../models/Version';
import fs from 'fs-extra';
import { Processor } from '../processors/interfaces/Processor';
import path from 'node:path';
import { Tracker } from '../trackers/interfaces/Tracker';
import { TDNode } from '../models/TDNode';
import {
    checkDependencies,
    dumpDiffToFile,
    dumpTDStateToFile,
    dumpTimestampToFile,
    extractNodeNameFromToc,
    findContainers,
    findFileByExt,
    getLastModifiedDate,
    getNodeInfoFromNFile,
    readDateFromFile,
    splitSet,
    validateDirectory,
    validateTag,
    verifyUrl
} from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import { TDState } from '../models/TDState';
import { TDError } from '../errors/TDError';
import { PropertyRuleEngine } from '../rules/properties/PropertyRuleEngine';
import hidefile from 'hidefile';
import { InputRuleEngine } from '../rules/inputs/InputRuleEngine';
import { TDEdge } from '../models/TDEdge';
import { MergeStatus, TrackerMergeResult } from '../merge/TrackerMergeResult';
import { TDMergeResult, TDMergeStatus } from '../models/TDMergeResult';
import { resolveWithCurrentBranch, resolveWithIncomingBranch } from '../merge/MergeParser';
import { TagError } from '../errors/TagError';
import { ProjectDependencies } from '../../renderer/src/models/ProjectDependencies';
import remoteRepoService from '../services/RemoteRepoService';
import { RemoteError } from '../errors/RemoteError';
import userDataManager from './UserDataManager';

export class TDProjectManager implements ProjectManager<TDState, TDMergeResult> {
    readonly processor: Processor;
    readonly hiddenDir: string;
    readonly tracker: Tracker;
    readonly propertyRuleEngine: PropertyRuleEngine;
    readonly inputRuleEngine: InputRuleEngine;
    readonly excludedFiles: RegExp[];
    readonly excludedProperties: RegExp[] = [/^pageindex\b/, /^view\b/, /^flags\b/, /^v\b/];
    private versionNameMax = 256;
    private descriptionMax = 1024;
    private stateFile = 'state.json';
    private workingStateFile = 'workingState.json';
    private diffFile = 'diff';
    private checkoutTimestampFile = 'checkout.timestamp';

    constructor(processor: Processor, tracker: Tracker, hiddenDir: string) {
        this.processor = processor;
        this.hiddenDir = hiddenDir;
        this.tracker = tracker;
        this.propertyRuleEngine = new PropertyRuleEngine();
        this.inputRuleEngine = new InputRuleEngine();

        this.excludedFiles = [
            /\.build$/,
            /\.start$/,
            /\.lod$/,
            /\.bin$/,
            /^local\/.*$/,
            /\.json$/,
            /.*\.dir\/[^/]+\.(n|parm|panel)$/
        ];
    }

    abortMerge(dir: string): Promise<void> {
        return this.tracker.abortMerge(this.hiddenDirPath(dir));
    }

    async getMergeStatus(dir: string): Promise<TDMergeResult> {
        const hiddenDirPath = this.hiddenDirPath(dir);
        const result: TrackerMergeResult = await this.tracker.getMergeResult(hiddenDirPath);
        log.debug('Getting merge status:', result.mergeStatus);

        if (result.mergeStatus === MergeStatus.FINISHED) {
            log.debug('No merge in progress');
            return Promise.resolve(new TDMergeResult(TDMergeStatus.FINISHED, null, null, null));
        }

        log.debug('Merge status is IN_PROGRESS.');
        const [currentState, incomingState] = await this.createStatesFromConflicts(dir);
        let commonState: TDState | null = null;
        if (result.lastCommonVersion) {
            commonState = await this.createVersionState(dir, result.lastCommonVersion);
        }
        return Promise.resolve(
            new TDMergeResult(TDMergeStatus.IN_PROGRESS, currentState, incomingState, commonState)
        );
    }

    async init(dir: string, dst?: string, src?: string): Promise<Version> {
        await validateDirectory(dir);

        if (src) {
            if (verifyUrl(src)) {
                return this.initFromUrl(dir, src);
            }

            try {
                await validateDirectory(src);
                fs.copySync(src, dir, {
                    recursive: true,
                    filter: (file) => {
                        const isToeFile = file.endsWith('.toe');
                        return isToeFile || fs.lstatSync(file).isDirectory();
                    }
                });
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

        try {
            await this.tracker.init(hiddenDirPath, dst);
            const version = await this.createVersion(
                dir,
                'Initial Version',
                'This is the initial version of your project'
            );
            if (dst) {
                await this.tracker.push(hiddenDirPath);
            }
            return Promise.resolve(version);
        } catch (error) {
            log.error(`Error initializing tracker at ${hiddenDirPath}. Cause:`, error);
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

    async createVersion(dir: string, versionName: string, description?: string): Promise<Version> {
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
            await this.saveVersionState(dir, this.stateFile);
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

    async hasChanges(dir: string): Promise<boolean> {
        await validateDirectory(dir);

        if (!(await this.isLastVersion(dir))) {
            return false;
        }

        const lastReferenceDate = await this.getLastReferenceDate(dir);
        const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
        const lastModified = await getLastModifiedDate(toeFile);

        log.debug(`${toeFile} was last modified at ${lastModified}`);

        return lastReferenceDate < lastModified;
    }

    async addTag(dir: string, versionId: string, tag: string): Promise<void> {
        await validateDirectory(dir);
        validateTag(tag);
        const hiddenDirPath = this.hiddenDirPath(dir);
        try {
            await this.tracker.addTag(hiddenDirPath, versionId, tag);
        } catch (error: any) {
            log.error(`Error creating tag for ${versionId}. Cause:`, error);
            if (error.message.includes('already exists')) {
                return Promise.reject(new TagError(`Tag ${tag} already exists`));
            }
            return Promise.reject(error);
        }
    }

    async removeTag(dir: string, versionId: string): Promise<void> {
        await validateDirectory(dir);
        const hiddenDirPath = this.hiddenDirPath(dir);
        try {
            await this.tracker.removeTag(hiddenDirPath, versionId);
        } catch (error) {
            log.error(`Error creating tag for ${versionId}. Cause:`, error);
            return Promise.reject(error);
        }
    }

    async goToVersion(dir: string, versionId: string): Promise<Version> {
        await validateDirectory(dir);

        if (await this.hasChanges(dir)) {
            log.error(`Unable to checkout to ${versionId}: working directory dirty.`);
            return Promise.reject(`Cannot move to version because of current changes.`);
        }

        const hiddenDir = this.hiddenDirPath(dir);
        await this.tracker.discardChanges(hiddenDir);
        await this.tracker.goToVersion(hiddenDir, versionId);
        await this.processor.postprocess(hiddenDir, dir);

        const currentVersion = await this.currentVersion(dir);
        const lastVersion = await this.lastVersion(dir);

        if (currentVersion.id === lastVersion.id) {
            const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
            const lastModified = await getLastModifiedDate(toeFile);
            await dumpTimestampToFile(
                lastModified,
                path.join(hiddenDir, this.checkoutTimestampFile)
            );
        }

        return currentVersion;
    }

    async discardChanges(dir: string): Promise<void> {
        await validateDirectory(dir);
        const hiddenDirPath = this.hiddenDirPath(dir);
        log.debug(`Discarded changes from ${dir}`);
        await this.tracker.discardChanges(this.hiddenDirPath(dir));
        if (await this.isLastVersion(dir)) {
            await this.processor.postprocess(hiddenDirPath, dir);
            const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
            const lastModified = await getLastModifiedDate(toeFile);
            await dumpTimestampToFile(
                lastModified,
                path.join(hiddenDirPath, this.checkoutTimestampFile)
            );
        }
    }

    async getVersionState(dir: string, versionId?: string): Promise<TDState> {
        log.debug('GetVersionState: ', versionId);
        const hiddenDir = this.hiddenDirPath(dir);
        if (versionId) {
            const content = await this.tracker.readFile(
                this.hiddenDirPath(dir),
                this.stateFile,
                versionId
            );
            return TDState.loadFromFile(content);
        }

        // Currently on working directory
        await this.processor.preprocess(dir, hiddenDir);
        let workingState: string, lastDiff: string;
        try {
            workingState = await this.tracker.readFile(
                this.hiddenDirPath(dir),
                this.workingStateFile,
                undefined
            );
            lastDiff = await this.tracker.readFile(this.hiddenDirPath(dir), this.diffFile);
        } catch (e) {
            await dumpDiffToFile(
                path.join(this.hiddenDirPath(dir), this.diffFile),
                await this.tracker.compare(this.hiddenDirPath(dir), undefined, undefined, false)
            );
            return await this.saveVersionState(dir, this.workingStateFile);
        }

        const diff = await this.tracker.compare(
            this.hiddenDirPath(dir),
            undefined,
            undefined,
            false
        );
        if (diff != lastDiff) {
            // TO DO: hay que comparar más inteligentemente estos diffs, porque ahora si cambia view te dan distinto
            // y eso no debería generar un nuevo state.
            await dumpDiffToFile(path.join(this.hiddenDirPath(dir), this.diffFile), diff);
            return await this.saveVersionState(dir, this.workingStateFile);
        }

        return TDState.loadFromFile(workingState);
    }

    async pull(dir: string): Promise<TDMergeResult> {
        if (await this.hasChanges(dir)) {
            return Promise.reject(`Cannot pull because of current changes.`);
        }
        const hiddenDirPath = this.hiddenDirPath(dir);
        const result: TrackerMergeResult = await this.tracker.pull(
            hiddenDirPath,
            this.excludedFiles,
            this.excludedProperties
        );

        if (result.mergeStatus === MergeStatus.UP_TO_DATE) {
            return new TDMergeResult(TDMergeStatus.UP_TO_DATE, null, null, null);
        } else if (
            result.mergeStatus === MergeStatus.FINISHED_WITHOUT_CONFLICTS ||
            result.mergeStatus === MergeStatus.FINISHED_WITHOUT_ACTIONS
        ) {
            await this.processor.postprocess(hiddenDirPath, dir);
            await this.saveVersionState(dir, this.stateFile);
            const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
            const lastModified = await getLastModifiedDate(toeFile);
            await dumpTimestampToFile(
                lastModified,
                path.join(hiddenDirPath, this.checkoutTimestampFile)
            );
            return new TDMergeResult(TDMergeStatus.FINISHED, null, null, null);
        } else if (result.mergeStatus === MergeStatus.FINISHED) {
            await this.processor.postprocess(hiddenDirPath, dir);
            await this.saveVersionState(dir, this.stateFile);
            await this.processor.preprocess(dir, hiddenDirPath);
            await this.tracker.createVersion(hiddenDirPath, 'MergeVersion');
            await this.processor.postprocess(hiddenDirPath, dir);
            await this.tracker.push(hiddenDirPath);
            const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
            const lastModified = await getLastModifiedDate(toeFile);
            await dumpTimestampToFile(
                lastModified,
                path.join(hiddenDirPath, this.checkoutTimestampFile)
            );
            return new TDMergeResult(TDMergeStatus.FINISHED, null, null, null);
        } else if (
            result.mergeStatus === MergeStatus.IN_PROGRESS &&
            result.unresolvedConflicts === null
        ) {
            log.error('MergeStatus IN_PROGRESS, unresolvedConflicts null');
            return Promise.reject(new TDError('MergeStatus IN_PROGRESS, unresolvedConflicts null'));
        }

        const [currentState, incomingState] = await this.createStatesFromConflicts(dir);

        log.debug(
            `MergeResult: IN_PROGRESS, currentState: ${currentState.toString()}, incomingState: ${incomingState.toString()}`
        );
        log.debug('Merge result common versionId: ', result.lastCommonVersion);
        let commonState: TDState | null = null;
        if (result.lastCommonVersion) {
            commonState = await this.createVersionState(dir, result.lastCommonVersion);
        }

        return new TDMergeResult(
            TDMergeStatus.IN_PROGRESS,
            currentState,
            incomingState,
            commonState
        );
    }

    async push(dir: string): Promise<void> {
        if (await this.hasChanges(dir)) {
            return Promise.reject(`Cannot push because of current changes.`);
        }
        const hiddenDirPath = this.hiddenDirPath(dir);
        await this.tracker.push(hiddenDirPath);
    }

    private hiddenDirPath = (dir: string): string => {
        return path.join(dir, this.hiddenDir);
    };

    async finishMerge(
        dir: string,
        userInputState: TDState,
        versionName: string,
        description: string
    ): Promise<void> {
        const hiddenDirPath = this.hiddenDirPath(dir);
        const result: TrackerMergeResult = await this.tracker.getMergeResult(hiddenDirPath);
        log.debug('Merge result status:', result.mergeStatus);
        log.debug('Merge result common versionId: ', result.lastCommonVersion);

        if (result.mergeStatus === MergeStatus.FINISHED) {
            log.debug('Merge already finished; no further action required.');
            return;
        }

        log.debug('Merge status is IN_PROGRESS; proceeding with merge resolution.');
        const [currentState, _] = await this.createStatesFromConflicts(dir);
        log.debug(`Unresolved conflicts count: ${currentState.nodes.length}`);

        const resolvedContents = new Map<string, string[]>();

        for (const userNode of userInputState.nodes) {
            log.debug(`Checking user node: ${userNode.name}`);
            const inCurrentState = currentState.isNodeInState(userNode);
            log.debug(
                `Node ${userNode.name} belongs to state ${inCurrentState ? 'Current' : 'Incoming'}`
            );
            const contentSelector = inCurrentState ? 0 : 1;
            log.debug(`Selected content: ${contentSelector === 0 ? 'Current' : 'Incoming'}`);

            for (const [filename, contentSet] of result.unresolvedConflicts!) {
                if (filename.startsWith(userNode.name)) {
                    const [contentsA, contentsB] = splitSet(contentSet);
                    const selectedContent = contentSelector === 0 ? contentsA : contentsB;
                    log.debug(`Resolved content for ${filename}: ${selectedContent.join(', ')}`);
                    resolvedContents.set(filename, selectedContent);
                }
            }
        }

        await this.tracker.settleConflicts(hiddenDirPath, resolvedContents);
        await this.processor.postprocess(hiddenDirPath, dir);
        await this.saveVersionState(dir, this.stateFile);
        await this.processor.preprocess(dir, hiddenDirPath);
        await this.tracker.createVersion(hiddenDirPath, versionName, description);
        await this.processor.postprocess(hiddenDirPath, dir);
        const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
        const lastModified = await getLastModifiedDate(toeFile);
        await dumpTimestampToFile(
            lastModified,
            path.join(hiddenDirPath, this.checkoutTimestampFile)
        );
        await this.tracker.push(hiddenDirPath);
        log.debug('Merge resolution complete.');
    }

    async lastVersion(dir: string): Promise<Version> {
        await validateDirectory(dir);
        return (await this.tracker.listVersions(this.hiddenDirPath(dir)))[0];
    }

    private async saveVersionState(dir: string, file: string): Promise<TDState> {
        const state = await this.createVersionState(dir);
        await dumpTDStateToFile(path.join(this.hiddenDirPath(dir), file), state);
        return state;
    }

    private async createVersionState(
        dir: string,
        versionId?: string,
        transformContent: (content: string) => string = (content) => content
    ): Promise<TDState> {
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
                const [node, nodeInputs] = await this.createNode(
                    hiddenDirPath,
                    toeDir,
                    container,
                    nodeName,
                    versionId,
                    transformContent
                );
                state.nodes.push(node);
                state.inputs.set(node.name, nodeInputs);
            } catch (error) {
                log.error(`Could not parse information for node ${nodeName} due to ${error}.`);
                return Promise.reject(new TDError(`Error getting state from ${dir}`));
            }
        }

        await this.processMissingEdgesForRenderNodes(
            state,
            hiddenDirPath,
            versionId,
            transformContent,
            toeDir,
            container
        );

        return state;
    }

    private async createNode(
        hiddenDirPath: string,
        toeDir: string,
        container: string,
        nodeName: string,
        versionId?: string,
        transformContent: (content: string) => string = (content) => content
    ): Promise<[TDNode, TDEdge[]]> {
        const files = [
            { ext: 'n', required: true },
            { ext: 'parm', required: false },
            { ext: 'network', required: false }
        ];

        const filePaths = files.map((file) =>
            path.posix.join(toeDir, container, `${nodeName}.${file.ext}`)
        );

        const fileContents = await Promise.all(
            filePaths.map(async (filePath, index) => {
                try {
                    const content = await this.tracker.readFile(hiddenDirPath, filePath, versionId);
                    return transformContent(content);
                } catch (error) {
                    if (files[index].required) {
                        return Promise.reject(
                            new TDError(
                                `Required file missing: ${files[index].ext} for node ${nodeName}`
                            )
                        );
                    }
                    return '';
                }
            })
        );

        return Promise.resolve(this.extractNodeAndInputs(nodeName, fileContents));
    }

    private processProperties(content: string, properties: Map<string, string>) {
        content.split('\n').forEach((line) => {
            this.propertyRuleEngine.applyRules(line, properties);
        });
    }

    private extractNodeAndInputs(nodeName: string, fileContents: string[]): [TDNode, TDEdge[]] {
        const properties = new Map<string, string>();
        fileContents.forEach((content) => this.processProperties(content, properties));

        const [type, subtype] = getNodeInfoFromNFile(fileContents[0])!;
        const node = new TDNode(nodeName, type, subtype, properties);

        const nodeInputs: TDEdge[] = [];
        fileContents.forEach((content) =>
            nodeInputs.push(...this.inputRuleEngine.process(content))
        );

        return [node, nodeInputs];
    }

    private async findFileWithCheck(dir: string, extension: string): Promise<string> {
        const file = findFileByExt(extension, dir);
        if (!file) {
            return Promise.reject(new MissingFileError(`Could not find ${extension} file`));
        }
        return file;
    }

    private extractNodeNamesFromToc(tocContent: string, container: string): string[] {
        const nodeNames: string[] = [];
        tocContent.split('\n').forEach((line) => {
            const trimmedLine = line.trim();
            const nodeName = extractNodeNameFromToc(container, trimmedLine);
            if (nodeName && !nodeNames.includes(nodeName)) {
                nodeNames.push(nodeName);
            }
        });
        return nodeNames;
    }

    private async initFromUrl(dir: string, url: string): Promise<Version> {
        const hiddenDirPath = this.hiddenDirPath(dir);
        await this.tracker.clone(dir, this.hiddenDir, url);
        hidefile.hideSync(hiddenDirPath);
        await this.processor.postprocess(hiddenDirPath, dir);
        const toeFile = path.join(dir, await this.findFileWithCheck(dir, 'toe'));
        const lastModified = await getLastModifiedDate(toeFile);
        await dumpTimestampToFile(
            lastModified,
            path.join(hiddenDirPath, this.checkoutTimestampFile)
        );
        return await this.tracker.initialVersion(hiddenDirPath);
    }

    private async createStatesFromConflicts(dir: string): Promise<[TDState, TDState]> {
        const currentState = await this.createVersionState(
            dir,
            undefined,
            resolveWithCurrentBranch
        );
        const incomingState = await this.createVersionState(
            dir,
            undefined,
            resolveWithIncomingBranch
        );
        return [currentState, incomingState];
    }

    private async isLastVersion(dir: string): Promise<boolean> {
        const currentVersion = await this.currentVersion(dir);
        const lastVersion = await this.lastVersion(dir);
        return currentVersion.id === lastVersion.id;
    }

    private async getLastReferenceDate(dir: string): Promise<Date> {
        const hiddenDir = this.hiddenDirPath(dir);

        const checkoutTimestamp = await readDateFromFile(
            path.join(hiddenDir, this.checkoutTimestampFile)
        );
        const lastCommitDate = (await this.tracker.listVersions(hiddenDir))[0].date;

        // Return the most recent date or fallback to lastCommitDate if checkoutTimestamp is undefined
        if (!checkoutTimestamp) {
            return lastCommitDate;
        }

        return checkoutTimestamp > lastCommitDate ? checkoutTimestamp : lastCommitDate;
    }

    private async processMissingEdgesForRenderNodes(
        state: TDState,
        hiddenDirPath: string,
        versionId: string | undefined,
        transformContent: (content: string) => string,
        toeDir: string,
        container: string
    ): Promise<void> {
        const topRenderNodes = state.nodes.filter(
            (node) => node.type === 'TOP' && node.subtype === 'render'
        );
        const compGeoNodes = state.nodes
            .filter((node) => node.type === 'COMP' && node.subtype === 'geo')
            .map((node) => node.name);
        const compLightNodes = state.nodes
            .filter(
                (node) =>
                    node.type === 'COMP' &&
                    (node.subtype === 'light' || node.subtype === 'environment')
            )
            .map((node) => node.name);

        for (const node of topRenderNodes) {
            const parmFilePath = path.posix.join(toeDir, container, `${node.name}.parm`);
            let parmFileContent = '';

            try {
                parmFileContent = await this.tracker.readFile(
                    hiddenDirPath,
                    parmFilePath,
                    versionId
                );
                parmFileContent = transformContent(parmFileContent);
            } catch {
                log.warn(`Missing or inaccessible .parm file for node ${node.name}`);
            }

            if (!parmFileContent.split('\n').some((line) => line.startsWith('camera'))) {
                state.inputs.get(node.name)?.push(new TDEdge('cam1', true));
            }

            if (!parmFileContent.split('\n').some((line) => line.startsWith('geometry'))) {
                for (const geoNode of compGeoNodes) {
                    state.inputs.get(node.name)?.push(new TDEdge(geoNode, true));
                }
            }

            if (!parmFileContent.split('\n').some((line) => line.startsWith('lights'))) {
                for (const lightNode of compLightNodes) {
                    state.inputs.get(node.name)?.push(new TDEdge(lightNode, true));
                }
            }
        }
    }

    checkDependencies(): Promise<ProjectDependencies[]> {
        return checkDependencies();
    }

    async isPublished(dir: string): Promise<boolean> {
        log.info(`Checking if ${dir} is published.`);
        await validateDirectory(dir);
        const hiddenDir = this.hiddenDirPath(dir);
        try {
            const remoteUrl = await this.tracker.getRemote(hiddenDir);
            return remoteUrl !== undefined;
        } catch (error: any) {
            log.error(`Error getting remote due to ${error.message}.`);
            return Promise.reject(new TDError(`Error verifying if ${hiddenDir} is published`));
        }
    }

    async publish(dir: string, name: string, description: string): Promise<void> {
        log.info(`Publishing ${dir} to Mariana Cloud`);
        await validateDirectory(dir);
        const hiddenDir = this.hiddenDirPath(dir);
        const response = await remoteRepoService.createRepository(name, description);
        if (response.errorCode) {
            log.error(`Could not publish ${dir}: received ${response.errorCode}`);
            return Promise.reject(new RemoteError('Unable to publish project', response.errorCode));
        }
        const remoteUrl = response.result!;
        try {
            await this.tracker.setRemote(hiddenDir, remoteUrl);
            userDataManager.addRemoteToProject(name, remoteUrl);
        } catch (error: any) {
            log.error(`Unable to set remote to ${dir}: ${error.message}`);
            return Promise.reject(new TDError(`Error publishing project to Mariana Cloud.`));
        }

        try {
            await this.tracker.push(hiddenDir);
        } catch (error: any) {
            log.error(`Unable to push to ${dir}: ${error.message}`);
            return Promise.reject(new TDError(`Error pushing project content to Mariana Cloud.`));
        }
    }
}
