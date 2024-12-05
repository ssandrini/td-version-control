import simpleGit, {
    FetchResult,
    GitResponseError,
    MergeConflict,
    MergeResult,
    SimpleGit,
    StatusResult
} from 'simple-git';
import { Tracker } from './interfaces/Tracker';
import { Version } from '../models/Version';
import { TrackerError } from '../errors/TrackerError';
import log from 'electron-log/main.js';
import { Author } from '../models/Author';
import fs from 'fs-extra';
import path from 'node:path';
import { Content, Filename, MergeStatus, TrackerMergeResult } from '../merge/TrackerMergeResult';
import {
    cleanMergeFile,
    parseMergeConflicts,
    preprocessMergeConflicts,
    resolveFileConflicts,
    resolveWithCurrentBranch
} from '../merge/MergeParser';
import { extractFileName, findFileByExt } from '../utils/utils';
import userDataManager from '../managers/UserDataManager';
import { User } from '../models/api/User';

export class SimpleGitTracker implements Tracker {
    readonly git: SimpleGit;
    readonly separator = '//';
    readonly EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
    readonly ignoredFiles = ['diff', 'workingState.json', 'checkout.timestamp'];
    readonly attributes: ReadonlyMap<string, string[]>;
    readonly REMOTE_NAME = 'origin';

    constructor() {
        this.git = simpleGit();
        this.attributes = new Map([['**/*.lod', ['binary', 'merge=ours', '-text']]]);
    }

    async init(dir: string, dst?: string): Promise<void> {
        await this.git.cwd(dir);
        await this.git.init();
        await this.git.raw(['branch', '-m', 'main']);

        const user: User = userDataManager.getUser()!;
        await this.git.raw(['config', '--local', 'core.autocrlf', 'false']);
        await this.git.raw(['config', '--local', 'user.name', user.username]);
        await this.git.raw(['config', '--local', 'user.email', user.email]);
        await this.git.raw(['config', '--local', 'push.autoSetupRemote', 'true']);

        const gitignorePath = path.join(dir, '.gitignore');
        await fs.writeFile(gitignorePath, this.ignoredFiles.join('\n'), 'utf-8');

        const gitAttributesPath = path.join(dir, '.gitattributes');
        const attributesContent = Array.from(this.attributes)
            .flatMap(([pattern, attributes]) => attributes.map((attr) => `${pattern} ${attr}`))
            .join('\n');
        await fs.writeFile(gitAttributesPath, attributesContent, 'utf-8');

        if (dst) {
            await this.git.addRemote('origin', dst);
        }
    }

    async currentVersion(dir: string): Promise<Version> {
        await this.git.cwd(dir);
        const log = await this.git.log({ maxCount: 1, multiLine: false });
        const latestCommit = log.latest;
        if (!latestCommit) {
            throw new TrackerError('No versions found');
        }
        const [name, ...description] = latestCommit.message.split(this.separator);
        return new Version(
            name,
            new Author(latestCommit.author_name, latestCommit.author_email),
            latestCommit.hash,
            new Date(latestCommit.date),
            description.join(this.separator)
        );
    }

    async initialVersion(dir: string): Promise<Version> {
        await this.git.cwd(dir);

        const initialCommitHash = await this.git.firstCommit();

        const log = await this.git.log();
        const initialCommit = log.all.find((log) => log.hash === initialCommitHash);

        if (!initialCommit) {
            throw new TrackerError('No initial version found');
        }

        const [name, ...description] = initialCommit.message.split(this.separator);
        return new Version(
            name,
            new Author(initialCommit.author_name, initialCommit.author_email),
            initialCommit.hash,
            new Date(initialCommit.date),
            description.join(this.separator)
        );
    }

    async listVersions(dir: string): Promise<Version[]> {
        await this.git.cwd(dir);
        const log = await this.git.log(['--branches']);
        return await Promise.all(
            log.all.map(async (commit) => {
                const [name, ...description] = commit.message.split(this.separator);
                const rawTag = await this.git.tag(['--points-at', commit.hash]);
                const tag = rawTag.trim() ? rawTag.trim().split('\n')[0] : undefined;
                return new Version(
                    name,
                    new Author(commit.author_name, commit.author_email),
                    commit.hash,
                    new Date(commit.date),
                    description.join(this.separator),
                    tag
                );
            })
        );
    }

    async createVersion(dir: string, versionName: string, description?: string): Promise<Version> {
        log.info(`Creating version ${versionName} (${description})`);
        await this.git.cwd(dir);
        await this.git.add('.');
        const message = `${versionName}${this.separator}${description || ''}`;
        await this.git.commit(message, [], { '--allow-empty': null });
        return this.currentVersion(dir);
    }

    async addTag(dir: string, versionId: string, tag: string): Promise<void> {
        log.info(`Creating tag ${tag} for ${versionId}`);
        await this.git.cwd(dir);
        try {
            await this.git.tag([tag, versionId]);
            log.info(`Tag "${tag}" added to version "${versionId}".`);
        } catch (error) {
            this.handleError(error, `Failed to add tag "${tag}" to version "${versionId}".`);
        }
    }

    async removeTag(dir: string, tag: string): Promise<void> {
        log.info(`Deleting tag ${tag}`);
        await this.git.cwd(dir);
        try {
            await this.git.tag(['-d', tag]);
            log.info(`Tag "${tag}" removed.`);
        } catch (error) {
            this.handleError(error, `Failed to remove tag "${tag}".`);
        }
    }

    async goToVersion(dir: string, versionId: string): Promise<Version> {
        await this.git.cwd(dir);

        const log = await this.git.log(['--all']);
        const commit = log.all.find((c) => c.hash === versionId);
        if (!commit) {
            throw new TrackerError(`Version with id "${versionId}" not found.`);
        }

        try {
            const mainLog = await this.git.log(['main']);
            if (mainLog.latest?.hash === versionId) {
                await this.git.checkout('main');
                const [name, ...description] = mainLog.latest.message.split(this.separator);
                return new Version(
                    name,
                    new Author(mainLog.latest.author_name, mainLog.latest.author_email),
                    mainLog.latest.hash,
                    new Date(mainLog.latest.date),
                    description.join('\n')
                );
            }
        } catch {
            throw new TrackerError(`Branch 'main' does not exist.`);
        }

        await this.git.checkout(commit.hash);
        const [name, ...description] = commit.message.split(this.separator);
        return new Version(
            name,
            new Author(commit.author_name, commit.author_email),
            commit.hash,
            new Date(commit.date),
            description.join('\n')
        );
    }

    async discardChanges(dir: string): Promise<void> {
        await this.git.cwd(dir);
        await this.git.raw(['restore', '.']);
        await this.git.raw(['clean', '-fd']);
    }

    async compare(
        dir: string,
        versionId?: string,
        file?: string,
        modified = false
    ): Promise<string> {
        await this.git.cwd(dir);

        const diffParams = ['--unified=0', ':!*.dir/.*', ':!*.dir/local/*'];
        if (modified) {
            diffParams.push('--diff-filter=M');
        }
        file = file ? file : '.';

        if (!versionId) {
            diffParams.push(file);
            return this.git.diff(diffParams);
        }

        const gitLog = await this.git.log(['--all']);
        const commit = gitLog.all.find((c) => c.hash === versionId);

        if (!commit) {
            throw new TrackerError(`Commit "${versionId}" not found.`);
        }

        let hasParent: string | undefined;
        try {
            hasParent = await this.git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);

            if (!hasParent) {
                log.error(`Invalid response from git rev-list for commit "${commit.hash}".`);
            }
        } catch (error) {
            const message = `Failed to check parents for commit "${commit.hash}"}`;
            this.handleError(error, message);
        }

        const parents = hasParent.trim().split(' ');
        diffParams.push(
            parents.length === 1 ? this.EMPTY_TREE_HASH : `${commit.hash}^`,
            commit.hash,
            file
        );
        return this.git.diff(diffParams);
    }

    async readFile(dir: string, filePath: string, versionId?: string): Promise<string> {
        if (!versionId) {
            return Promise.resolve(this.readFileContent(path.join(dir, filePath)));
        }

        await this.git.cwd(dir);
        try {
            return await this.git.show([`${versionId}:${filePath}`]);
        } catch (error) {
            const errorMessage = `Failed to read file "${filePath}" at commit "${versionId}":`;
            this.handleError(error, errorMessage);
        }
    }

    // clone into output within directory dir
    async clone(dir: string, output: string, url: string): Promise<void> {
        await this.git.cwd(dir);
        try {
            const { username, password } = userDataManager.getUserCredentials()!;
            const normalizedUrl = new URL(url);
            normalizedUrl.protocol = 'https:';
            normalizedUrl.username = username;
            normalizedUrl.password = password;
            const remoteWithCredentials = normalizedUrl.toString();
            log.debug('remote with cred: ', remoteWithCredentials);
            await this.git.clone(remoteWithCredentials, output, {
                '--config': 'core.autocrlf=false'
            });
            await this.git.cwd(path.join(dir, output));
            const user: User = userDataManager.getUser()!;
            await this.git.raw(['config', '--local', 'user.name', user.username]);
            await this.git.raw(['config', '--local', 'user.email', user.email]);
            await this.git.raw(['config', '--local', 'push.autoSetupRemote', 'true']);
        } catch (error) {
            const errorMessage = `Failed cloning ${url} into ${dir}`;
            this.handleError(error, errorMessage);
        }
    }

    async pull(
        dir: string,
        excludedFiles: RegExp[],
        linesMatching: RegExp[]
    ): Promise<TrackerMergeResult> {
        this.git.cwd(dir);
        log.info('Starting pull operation');

        let fetchResult: FetchResult;
        try {
            const remoteUrl = await this.addCredentialsToRemoteUrl(dir);
            fetchResult = await this.git.fetch(remoteUrl, ['--tags']);
            log.info('Fetch completed successfully.');
        } catch (fetchError) {
            this.handleError(fetchError, 'Fetch failed during pull operation');
        }

        log.debug('Fetch result: ', fetchResult);

        const revResult: string = await this.git.raw([
            'rev-list',
            '--left-right',
            'HEAD...FETCH_HEAD'
        ]);
        log.debug('revResult: ', revResult);
        if (
            fetchResult.updated.length === 0 &&
            fetchResult.deleted.length === 0 &&
            revResult.trim().length === 0
        ) {
            log.info('FETCH indicates repository is up-to-date.');
            return { mergeStatus: MergeStatus.UP_TO_DATE, unresolvedConflicts: null };
        }

        let commonAncestorHash: string | undefined;
        try {
            const mergeBaseResult = await this.git.raw(['merge-base', 'HEAD', 'FETCH_HEAD']);
            commonAncestorHash = mergeBaseResult.trim();
            log.info(`Last common ancestor commit: ${commonAncestorHash}`);
        } catch (error) {
            log.error('Error determining the common ancestor:', error);
            commonAncestorHash = undefined;
        }

        let conflicts: MergeConflict[];
        try {
            const mergeSummary = await this.git.merge(['FETCH_HEAD']);
            if (mergeSummary.merges.length === 0) {
                log.info('Merge finished without actions.');
                return {
                    mergeStatus: MergeStatus.FINISHED_WITHOUT_ACTIONS,
                    unresolvedConflicts: null
                };
            }
            log.info(`Merged ${mergeSummary.merges.length} files without conflicts.`);
            return {
                mergeStatus: MergeStatus.FINISHED_WITHOUT_CONFLICTS,
                unresolvedConflicts: null
            };
        } catch (error) {
            const gitError = error as GitResponseError<MergeResult>;
            const mergeSummary = gitError.git;
            if (!mergeSummary) {
                this.handleError(error, 'Merge failed without conflict details.');
            }
            conflicts = mergeSummary.conflicts;
        }

        // TOC file has conflicts
        const tocConflict = conflicts.find((c: MergeConflict) => c.file?.endsWith('.toc'));
        if (tocConflict && tocConflict.file) {
            const toeDir = findFileByExt('dir', dir);
            const tocPath = path.join(dir, tocConflict.file);
            const tocContent = this.readFileContent(tocPath);
            log.debug('TOC file conflict');
            const deleted = Array.from(
                new Set(
                    (await this.git.status()).deleted.map((path) =>
                        path.substring(path.indexOf('/') + 1, path.lastIndexOf('.'))
                    )
                )
            );
            let cleanToc = cleanMergeFile(tocContent, deleted);
            const tocLines = cleanToc.split('\n');
            const validLines = tocLines.filter((line) => {
                const filePath = path.resolve(dir, toeDir!, line.trim());
                return fs.existsSync(filePath);
            });
            cleanToc = validLines.join('\n');
            fs.writeFileSync(tocPath, cleanToc);
            await this.git.add(tocConflict.file);
        }

        log.info(`Merge encountered ${conflicts.length} conflict(s)`);
        const conflictMap = new Map<Filename, Set<[Content, Content]>>();

        for (const conflict of conflicts) {
            const filePath = path.join(dir, conflict.file!);
            let currentContent = this.readFileContent(filePath);

            log.info(`Conflict detected in file "${conflict.file}" due to: ${conflict.reason}`);
            const normalizedFilePath = filePath.replace(/\\/g, '/');
            if (excludedFiles.some((regex) => regex.test(normalizedFilePath))) {
                log.info(`Auto-resolving conflict for excluded file: ${filePath}`);
                currentContent = resolveWithCurrentBranch(currentContent);
                fs.writeFileSync(filePath, currentContent);
                await this.git.add(conflict.file!);
                continue;
            }

            log.info(
                `Unable to auto-resolve conflict in file "${conflict.file}". Marking as unresolved.`
            );

            log.debug(`Preprocessing file ${conflict.file}`);
            const newContent = preprocessMergeConflicts(currentContent, linesMatching);
            if (newContent !== currentContent) {
                fs.writeFileSync(filePath, newContent);
            }

            const conflictSet: Set<[Content, Content]> = parseMergeConflicts(newContent);
            if (conflictSet.size > 0) {
                conflictMap.set(extractFileName(conflict.file!)!, conflictSet);
            } else {
                await this.git.add(conflict.file!);
            }
        }

        if (conflictMap.size > 0) {
            log.info('Merge status: IN_PROGRESS with unresolved conflicts');
            return {
                mergeStatus: MergeStatus.IN_PROGRESS,
                unresolvedConflicts: conflictMap,
                lastCommonVersion: commonAncestorHash
            };
        }

        return { mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null };
    }

    async push(dir: string): Promise<void> {
        log.info(`Pushing changes from ${dir}`);
        await this.git.cwd(dir);
        try {
            const remoteUrl = await this.addCredentialsToRemoteUrl(dir);
            const branches = await this.git.branch(['--list']);
            const currentBranch = branches.current;

            const hasUpstream = branches.all.some((branch) =>
                branch.includes(`remotes/origin/${currentBranch}`)
            );

            if (!hasUpstream) {
                log.info(`Setting upstream branch for the first push.`);
                await this.git.push(['-u', remoteUrl, 'HEAD']);
                await this.git.pushTags(remoteUrl);
            } else {
                const result = await this.git.push(remoteUrl);
                await this.git.pushTags(remoteUrl);
                log.info(`Push successful: ${result.pushed.length} references updated.`);
            }
        } catch (error) {
            const errorMessage = `Failed to push changes from ${dir}`;
            this.handleError(error, errorMessage);
        }
    }

    async settleConflicts(dir: string, userInput: Map<Filename, Content[]>): Promise<void> {
        this.git.cwd(dir);
        log.info('Starting merge finalization');
        try {
            const status: StatusResult = await this.git.status();
            const conflictedFiles = status.conflicted;
            await this.checkConflicts(conflictedFiles, userInput);
            await this.resolveConflictsForFiles(dir, conflictedFiles, userInput);
        } catch (error) {
            const errorMessage = 'Error in finish merge';
            this.handleError(error, errorMessage);
        }
    }

    async abortMerge(dir: string): Promise<void> {
        try {
            await this.git.cwd(dir);
            log.info('Attempting to abort the current merge');
            await this.git.merge(['--abort']);
            log.info('Merge aborted successfully');
        } catch (error) {
            this.handleError(error, 'Failed to abort merge');
        }
    }

    private handleError(error: unknown, message: string): never {
        const cause = error instanceof Error ? error.message : String(error);
        log.error(`Error message: ${message}`);
        log.debug(`Cause: ${cause}`);
        throw new TrackerError(message);
    }

    private readFileContent(filePath: string): string {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            const errorMessage = `Failed to read file: ${filePath}.`;
            throw new TrackerError(errorMessage);
        }
    }

    private async addResolvedFileToGit(file: string): Promise<void> {
        try {
            await this.git.add(file);
        } catch (error) {
            const errorMessage = `Failed to add resolved file to git: ${file}`;
            this.handleError(error, errorMessage);
        }
    }

    private async resolveConflictsForFiles(
        dir: string,
        conflictedFiles: string[],
        userInput: Map<Filename, Content[]>
    ): Promise<void> {
        for (const file of conflictedFiles) {
            const filePath = path.join(dir, file);
            const currentContent = this.readFileContent(filePath);

            const userConflicts = userInput.get(extractFileName(filePath)!);
            if (!userConflicts) {
                const errorMessage = `No user input found for conflicted file: ${file}`;
                log.error(errorMessage);
                throw new TrackerError(errorMessage);
            }

            const resolvedContent = resolveFileConflicts(currentContent, userConflicts);

            fs.writeFileSync(filePath, resolvedContent);

            await this.addResolvedFileToGit(file);
        }
    }

    private async checkConflicts(
        conflictedFiles: string[],
        userInput: Map<Filename, Content[]>
    ): Promise<void> {
        if (conflictedFiles.length !== userInput.size) {
            log.error();
            const errorMessage = `Mismatch between conflicted files (${conflictedFiles.length}) and user input (${userInput.size})`;
            log.error(errorMessage);
            throw new TrackerError(errorMessage);
        }
    }

    private async addCredentialsToRemoteUrl(dir: string): Promise<string> {
        await this.git.cwd(dir);
        try {
            const remoteUrl = (await this.git.listRemote(['--get-url'])).trim();
            const { username, password } = userDataManager.getUserCredentials()!;
            const normalizedUrl = new URL(remoteUrl);
            normalizedUrl.protocol = 'https:';
            normalizedUrl.username = username;
            normalizedUrl.password = password;
            const remoteWithCredentials = normalizedUrl.toString();
            log.debug('remote with cred: ', remoteWithCredentials);
            return remoteWithCredentials;
        } catch (e) {
            log.error('addCredentialsToRemoteUrl failed: ', e);
            throw e;
        }
    }

    async getMergeResult(dir: string): Promise<TrackerMergeResult> {
        await this.git.cwd(dir);

        const status: StatusResult = await this.git.status();
        const conflictedFiles = status.conflicted;

        if (conflictedFiles.length === 0) {
            return { mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null };
        }

        const conflictMap = new Map<Filename, Set<[Content, Content]>>();
        for (const file of conflictedFiles) {
            const filePath = path.join(dir, file);
            const currentContent = this.readFileContent(filePath);
            log.info(`Conflict detected in file "${file}" due to: merge conflict`);
            const conflicts = parseMergeConflicts(currentContent);
            conflictMap.set(extractFileName(file)!, conflicts);
        }

        let commonAncestorHash: string | undefined;
        if (conflictMap.size > 0) {
            try {
                const mergeBaseResult = await this.git.raw(['merge-base', 'HEAD', 'MERGE_HEAD']);
                commonAncestorHash = mergeBaseResult.trim();
                log.info(`Last common ancestor commit: ${commonAncestorHash}`);
            } catch (error) {
                log.error('Error determining the common ancestor:', error);
                commonAncestorHash = undefined;
            }

            return {
                mergeStatus: MergeStatus.IN_PROGRESS,
                unresolvedConflicts: conflictMap,
                lastCommonVersion: commonAncestorHash
            };
        }

        return { mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null };
    }

    async setRemote(dir: string, url: string): Promise<void> {
        log.info(`Setting remote to URL "${url}" in ${dir}`);
        await this.git.cwd(dir);
        try {
            const remotes = await this.git.getRemotes();
            const existingRemote = remotes.find((remote) => remote.name === this.REMOTE_NAME);
            if (existingRemote) {
                // If the remote already exists, update the URL
                await this.git.remote(['set-url', this.REMOTE_NAME, url]);
            } else {
                // Otherwise, add a new remote
                await this.git.addRemote(this.REMOTE_NAME, url);
            }
            log.info(`Remote set to "${url}" successfully.`);
        } catch (error) {
            this.handleError(error, `Failed to set remote to "${url}".`);
        }
    }

    async getRemote(dir: string): Promise<string | undefined> {
        log.info(`Fetching URL for remote in ${dir}`);
        await this.git.cwd(dir);
        try {
            // Get the URL of the specified remote
            const remoteUrl = (await this.git.remote(['get-url', this.REMOTE_NAME])) || undefined;
            log.info(`Remote URL: ${remoteUrl}`);
            return remoteUrl;
        } catch (error) {
            this.handleError(error, `Failed to fetch URL for remote.`);
        }
    }
}
