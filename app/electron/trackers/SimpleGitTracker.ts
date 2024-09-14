import simpleGit, { SimpleGit } from 'simple-git';
import { Tracker } from '../trackers/interfaces/Tracker';
import { Version } from '../models/Version';
import { TrackerError } from '../errors/TrackerError';
import log from 'electron-log/main';

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
            latestCommit.author_name,
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
                commit.author_name,
                commit.hash,
                new Date(commit.date),
                description.join(this.separator)
            );
        });
    }

    async createVersion(dir: string, versionName: string, description?: string): Promise<Version> {
        log.debug(`Creating version ${versionName} (${description})`)
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
            commit.author_name,
            commit.hash,
            new Date(commit.date),
            description.join('\n')
        );
    }

    async compare(dir: string, to?: string): Promise<string> {
        await this.git.cwd(dir);
        if (!to) {
            return this.git.diff();
        }
        const log = await this.git.log();
        const commit = log.all.find(c => c.hash === to);
        if (!commit) {
            throw new TrackerError(`Commit "${to}" not found.`);
        }
        return this.git.diff([commit.hash]);
    }
}
