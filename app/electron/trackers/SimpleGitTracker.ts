import simpleGit, { SimpleGit } from 'simple-git';
import { Tracker } from '../trackers/interfaces/Tracker';
import { Version } from '../models/Version';
import { TrackerError } from '../errors/TrackerError';
import log from 'electron-log/main';
import { Author } from '../models/Author';
import fs from 'fs-extra';
import path from 'node:path';

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
    

    async init(dir: string): Promise<void> {
        await this.git.cwd(dir);
        await this.git.init();
        // TODO: uncomment this and add CRLF
        // await this.git.raw(['config', '--local', 'user.name', this.username]);
        // await this.git.raw(['config', '--local', 'user.email', this.email]);
        const gitignorePath = path.join(dir, '.gitignore');
        await fs.writeFile(gitignorePath, this.ignoredFiles.join('\n'), 'utf-8');
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
        const log = await this.git.log(['--all']);
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new TrackerError(`Failed to check parents for commit "${commit.hash}": ${errorMessage}`);
        }

        const parents = hasParent.trim().split(' ');
        diffParams.push(parents.length === 1 ? this.EMPTY_TREE_HASH : `${commit.hash}^`, commit.hash, file);
        return this.git.diff(diffParams);
    }

    async readFile(dir: string, filePath: string, versionId?: string): Promise<string> {
        if (!versionId) {
            return fs.readFileSync(path.join(dir, filePath), 'utf-8');
        }
        
        await this.git.cwd(dir);
        try {
            return await this.git.show([`${versionId}:${filePath}`]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new TrackerError(`Failed to read file "${filePath}" at commit "${versionId}": ${errorMessage}`);
        }
    }

    async clone(dir: string, url: string): Promise<void> {
        // Equivalent to running `git clone url dir`
        try {
            await this.git.clone(url, dir);
        } catch(error) {
            const errorMessage = `Failed cloning ${url} into ${dir}`;
            log.error(errorMessage);
            throw new TrackerError(errorMessage);
        }
    }

    async pull(dir: string): Promise<void> {
        log.info(`Pulling latest changes in ${dir}`);
        await this.git.cwd(dir);
        try {
            const result = await this.git.pull();
            log.info(`Pull successful: ${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions.`);
        } catch (error) {
            const errorMessage = `Failed to pull changes in ${dir}`;
            log.error(errorMessage, error);
            throw new TrackerError(errorMessage);
        }
    }
    
    async push(dir: string): Promise<void> {
        log.info(`Pushing changes from ${dir}`);
        await this.git.cwd(dir);
        try {
            const result = await this.git.push();
            log.info(`Push successful: ${result.pushed.length} references updated.`);
        } catch (error) {
            const errorMessage = `Failed to push changes from ${dir}`;
            log.error(errorMessage, error);
            throw new TrackerError(errorMessage);
        }
    }
    
}
