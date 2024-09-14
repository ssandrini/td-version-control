import log from 'electron-log/main';
import { ProjectManager } from './interfaces/ProjectManager';
import { Version } from '../models/Version';
import fs from 'fs-extra';
import { Processor } from '../processors/interfaces/Processor';
import path from 'node:path';
import { Tracker } from '../trackers/interfaces/Tracker';

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
    }

    async init(dir: string, src?: string): Promise<Version> {
        await this.validateDirectory(dir);

        if (src) {
            try {
                await this.validateDirectory(src);
                fs.copySync(src, dir, { recursive: true });
                log.debug(`Copied ${src} into ${dir}`);
            } catch (error) {
                log.error(`Error copying ${src} into ${dir}. Cause:`, error);
                return Promise.reject(error);
            }
        }
        
        const hiddenDirPath = this.hiddenDirPath(dir);

        try {
            fs.mkdirSync(hiddenDirPath);
        } catch(error) {
            log.error(`Error creating directory ${hiddenDirPath}. Cause:`, error);
            return Promise.reject(error);
        }
        
        let output;
        try{
            output = await this.processor.preprocess(dir, hiddenDirPath);
        } catch(error) {
            return Promise.reject(error);
        }
        log.debug(`Created ${output} at ${hiddenDirPath}`);
        try {
            return await this.tracker.init(hiddenDirPath);
        } catch (error) {
            log.error(`Error initializing tracker at ${hiddenDirPath}. Cause:`, error);
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
        
        await this.validateDirectory(dir);
        const hiddenDirPath = this.hiddenDirPath(dir);
        try {
            const createdVersion = await this.tracker.createVersion(hiddenDirPath, versionName, description);
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

    async compare(dir: string, to?: string): Promise<unknown> {
        await this.validateDirectory(dir);
        return this.tracker.compare(this.hiddenDirPath(dir), to);
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