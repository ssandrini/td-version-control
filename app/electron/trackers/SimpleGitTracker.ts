import simpleGit, { SimpleGit } from 'simple-git';
import { Tracker } from '../trackers/interfaces/Tracker';
import { Version } from '../models/Version';
import { TrackerError } from '../errors/TrackerError';
import log from 'electron-log/main';
import { Author } from '../models/Author';

export class SimpleGitTracker implements Tracker {
    readonly git: SimpleGit;
    readonly setupErrorMessage = 'Tracker not setup. Use method setup()';
    readonly username: string;
    readonly email: string;
    readonly separator = '//';


    constructor(username: string, email: string) {
        this.git = simpleGit();
        this.username = username;
        this.email = email;
    }

    async init(dir: string): Promise<Version> {
        await this.git.cwd(dir);
        await this.git.init();
        await this.git.raw(['config', '--local', 'user.name', this.username]);
        await this.git.raw(['config', '--local', 'user.email', this.email]);
        return this.createVersion(
            dir,
            'Initial version',
            'This is the inital version of your project!'
        )
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
        const log = await this.git.log();
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
        log.info(`Creating version ${versionName} (${description})`)
        await this.git.cwd(dir);
        await this.git.add('.');
        const message = `${versionName}${this.separator}${description || ''}`;
        await this.git.commit(message, [], { '--allow-empty': null });
        return this.currentVersion(dir);
    }

    async goToVersion(dir: string, versionId: string): Promise<Version> {
        await this.git.cwd(dir);
        const log = await this.git.log();
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

    async compare(dir: string, versionId?: string, file?: string): Promise<string> {
        await this.git.cwd(dir);
        file = file? file : '.';
    
        if (!versionId) {
            return await this.git.diff([file])
        }
    
        const gitLog = await this.git.log();
        const commit = gitLog.all.find(c => c.hash === versionId);
    
        if (!commit) {
            throw new TrackerError(`Commit "${versionId}" not found.`);
        }
    
        let hasParent: string | undefined;
        try {
            hasParent = await this.git.raw(['rev-list', '--parents', '-n', '1', commit.hash]);
    
            if (!hasParent || typeof hasParent !== 'string') {
                throw new TrackerError(`Invalid response from git rev-list for commit "${commit.hash}".`);
            }
        } catch (error) {
            throw new TrackerError(`Failed to check parents for commit "${commit.hash}": ${error.message}`);
        }
    
        const parents = hasParent.trim().split(' ');
    
        if (parents.length === 1) {
            const emptyTreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
            return await this.git.diff([emptyTreeHash, commit.hash, file])
        }
    
        return await this.git.diff([`${commit.hash}^`, commit.hash, file])
    }        

}
