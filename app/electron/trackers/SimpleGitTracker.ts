import simpleGit, {GitResponseError, MergeResult, SimpleGit, StatusResult} from 'simple-git';
import { Tracker } from './interfaces/Tracker';
import { Version } from '../models/Version';
import { TrackerError } from '../errors/TrackerError';
import log from 'electron-log/main';
import { Author } from '../models/Author';
import fs from 'fs-extra';
import path from 'node:path';
import {Content, Filename, MergeStatus, TrackerMergeResult} from "../merge/TrackerMergeResult";
import {parseMergeConflicts, resolveFileConflicts, resolveWithCurrentBranch} from "../merge/MergeParser";
import {extractFileName} from "../utils/utils";
import userDataManager from "../managers/UserDataManager";

export class SimpleGitTracker implements Tracker {
    readonly git: SimpleGit;
    readonly username: string;
    readonly email: string;
    readonly separator = '//';
    readonly EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
    readonly ignoredFiles = ['diff', 'workingState.json'];

    constructor(username: string, email: string) {
        this.git = simpleGit();
        this.username = username;
        this.email = email;
    }


    async init(dir: string, dst?: string): Promise<void> {
        await this.git.cwd(dir);
        await this.git.init();
        // TODO: uncomment this and add CRLF
        await this.git.raw(['config', '--local', 'user.name', "BraveJero"]);
        await this.git.raw(['config', '--local', 'user.email', "jbrave@itba.edu.ar"]);
        await this.git.raw(['config', '--local', 'push.autoSetupRemote', "true"])
        const gitignorePath = path.join(dir, '.gitignore');
        await fs.writeFile(gitignorePath, this.ignoredFiles.join('\n'), 'utf-8');
        if(dst) {
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

    async listVersions(dir: string): Promise<Version[]> {
        await this.git.cwd(dir);
        const log = await this.git.log(['--branches']);
        return log.all.map(commit => {
            const [name, ...description] = commit.message.split(this.separator);
            return new Version(
                name,
                new Author(commit.author_name, commit.author_email),
                commit.hash,
                new Date(commit.date),
                description.join(this.separator)
            );
        });
    }

    async createVersion(dir: string, versionName: string, description?: string): Promise<Version> {
        log.info(`Creating version ${versionName} (${description})`);
        await this.git.cwd(dir);
        await this.git.add('.');
        const message = `${versionName}${this.separator}${description || ''}`;
        await this.git.commit(message, [], { '--allow-empty': null });
        return this.currentVersion(dir);
    }

    async goToVersion(dir: string, versionId: string): Promise<Version> {
        await this.git.cwd(dir);
        const log = await this.git.log(['--all']);
        const commit = log.all.find(c => c.hash === versionId);
        if (!commit) {
            throw new TrackerError(`Version with id "${versionId}" not found.`);
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

    async compare(dir: string, versionId?: string, file?: string, modified = false): Promise<string> {
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
        const commit = gitLog.all.find(c => c.hash === versionId);

        if (!commit) {
            throw new TrackerError(`Commit "${versionId}" not found.`);
        }

        let hasParent: string | undefined;
        try {
            hasParent = await this.git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);

            if (!hasParent || typeof hasParent !== 'string') {
                log.error(`Invalid response from git rev-list for commit "${commit.hash}".`);
            }
        } catch (error) {
            const message = `Failed to check parents for commit "${commit.hash}"}`;
            this.handleError(error, message);
        }

        const parents = hasParent.trim().split(' ');
        diffParams.push(parents.length === 1 ? this.EMPTY_TREE_HASH : `${commit.hash}^`, commit.hash, file);
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

    async clone(dir: string, url: string): Promise<void> {
        try {
            const { username, password } = userDataManager.getUserCredentials()!;
            const normalizedUrl = new URL(url);
            normalizedUrl.protocol = 'http:';
            normalizedUrl.username = username;
            normalizedUrl.password = password;
            const remoteWithCredentials = normalizedUrl.toString();
            log.debug("remote with cred: ", remoteWithCredentials);
            await this.git.clone(remoteWithCredentials, dir);
        } catch(error) {
            const errorMessage = `Failed cloning ${url} into ${dir}`;
            this.handleError(error, errorMessage);
        }
    }

    async pull(dir: string, excludedFiles: RegExp[]): Promise<TrackerMergeResult> {
        this.git.cwd(dir);
        log.info("Starting pull operation with fetch");

        try {
            const remoteUrl = await this.addCredentialsToRemoteUrl(dir);
            await this.git.fetch(remoteUrl);
            log.info("Fetch completed successfully.");
        } catch (fetchError) {
            const errorMessage = "Fetch failed in pull operation";
            this.handleError(fetchError, errorMessage);
        }

        let conflicts;
        try {
            const mergeSummary = await this.git.merge(['FETCH_HEAD']);
            log.info(`Merged ${mergeSummary.merges.length} files without conflicts.`);
            return Promise.resolve({mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null});
        } catch (error) {
            const gitError = error as GitResponseError<MergeResult>;
            const mergeSummary = gitError.git;
            if (!mergeSummary) {
                const errorMessage = "Merge failed, but no conflict details were available."
                this.handleError(error, errorMessage);
            }
            conflicts = mergeSummary.conflicts;
        }

        log.info(`Merge encountered ${conflicts.length} conflict(s)`);
        const conflictMap = new Map<Filename, Set<[Content, Content]>>();

        for (const conflict of conflicts) {
            const filePath = path.join(dir, conflict.file!);
            let currentContent = this.readFileContent(filePath);

            log.info(`Conflict detected in file "${conflict.file}" due to: ${conflict.reason}`);
            // log.debug(`Current content:\n${currentContent}`);

            // Automatic conflict resolution
            if (excludedFiles.some((regex) => regex.test(filePath))) {
                log.info(`Auto-resolving conflict for excluded file: ${filePath}`);
                currentContent = resolveWithCurrentBranch(currentContent);
                fs.writeFileSync(filePath, currentContent);
                await this.git.add(conflict.file!);
                continue;
            }

            // Non-automatic conflicts
            log.info(`Unable to auto-resolve conflict in file "${conflict.file}". Marking as unresolved.`);
            conflictMap.set(extractFileName(conflict.file!)!, parseMergeConflicts(currentContent));
        }

        if (conflictMap.size > 0) {
            log.info("Merge status: IN_PROGRESS with unresolved conflicts");
            return Promise.resolve({mergeStatus: MergeStatus.IN_PROGRESS, unresolvedConflicts: conflictMap});
        }

        return Promise.resolve({mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null});
    }

    async push(dir: string): Promise<void> {
        log.info(`Pushing changes from ${dir}`);
        await this.git.cwd(dir);
        try {
            let result;
            const remoteUrl = await this.addCredentialsToRemoteUrl(dir);
            result = await this.git.push(remoteUrl);
            log.info(`Push successful: ${result.pushed.length} references updated.`);
        } catch (error) {
            const errorMessage = `Failed to push changes from ${dir}`;
            this.handleError(error, errorMessage);
        }
    }

    async settleConflicts(dir: string, userInput: Map<Filename, Content[]>): Promise<void> {
        this.git.cwd(dir);
        log.info("Starting merge finalization");
        try {
            const status: StatusResult = await this.git.status();
            const conflictedFiles = status.conflicted;
            await this.checkConflicts(conflictedFiles, userInput);
            await this.resolveConflictsForFiles(dir, conflictedFiles, userInput);
        } catch (error) {
            const errorMessage = "Error in finish merge";
            this.handleError(error, errorMessage);
        }
    }

    async abortMerge(dir: string): Promise<void> {
        try {
            await this.git.cwd(dir);
            log.info("Attempting to abort the current merge");
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
            this.handleError(error, errorMessage);
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

    private async resolveConflictsForFiles(dir: string, conflictedFiles: string[], userInput: Map<Filename, Content[]>): Promise<void> {
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

    private async checkConflicts(conflictedFiles: string[], userInput: Map<Filename, Content[]>): Promise<void> {
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
            normalizedUrl.protocol = 'http:';
            normalizedUrl.username = username;
            normalizedUrl.password = password;
            const remoteWithCredentials = normalizedUrl.toString();
            log.debug("remote with cred: ", remoteWithCredentials);
            return remoteWithCredentials;
        } catch (e) {
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

        if (conflictMap.size > 0) {
            return { mergeStatus: MergeStatus.IN_PROGRESS, unresolvedConflicts: conflictMap };
        }

        return { mergeStatus: MergeStatus.FINISHED, unresolvedConflicts: null };
    }

}
