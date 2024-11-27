import { Processor } from './interfaces/Processor';
import log from 'electron-log/main.js';
import { findFileByExt } from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import path from 'node:path';

export class TDProcessor implements Processor {
    async preprocess(dir: string, outDir?: string): Promise<string[]> {
        const originalDir = process.cwd();
        try {
            process.chdir(dir);
        } catch (error) {
            log.error(`Error changing directory to ${dir}.`);
            return Promise.reject(error);
        }
        const toePath = findFileByExt('toe');
        if (toePath === undefined) {
            const msg = `No toe file found in project dir (${dir}).`;
            log.error(msg);
            process.chdir(originalDir);
            return Promise.reject(new MissingFileError(msg));
        }

        try {
            execSync(`toeexpand.exe ${toePath}`, {
                stdio: ['ignore', 'ignore', 'inherit'],
                windowsHide: true
            });
            process.chdir(originalDir);
            return Promise.reject();
        } catch (error) {
            // This is not a mistake. toeexpand is implemented in a way such that it returns
            // failure when succeeds.
        }
        log.info(`Expanded ${toePath} to ${dir}`);

        const tocPath = `${toePath}.toc`;
        const dirPath = `${toePath}.dir`;

        const files = await fs.readdir(dir);
        if (files.filter((file) => file === tocPath || file === dirPath).length != 2) {
            log.error(`Missing ${tocPath} or ${dirPath} in ${dir}`);
            process.chdir(originalDir);
            return Promise.reject(new MissingFileError(`Could not find ${tocPath} or ${dirPath}`));
        }

        if (outDir) {
            try {
                await fs.move(tocPath, path.join(outDir, tocPath), { overwrite: true });
                await fs.move(dirPath, path.join(outDir, dirPath), { overwrite: true });
            } catch (error) {
                log.error(`Error moving ${tocPath} and ${dirPath} to ${outDir}`);
                process.chdir(originalDir);
                return Promise.reject(error);
            }
        }
        log.info(`${toePath} expanded and moved to ${path.join(dir, outDir!)} successfully.`);
        process.chdir(originalDir);
        return Promise.resolve([tocPath, dirPath]);
    }

    postprocess(dir: string, outDir?: string): Promise<string[]> {
        const originalDir = process.cwd();
        try {
            process.chdir(dir);
        } catch (error) {
            log.error(`Error changing directory to ${dir}.`);
            return Promise.reject(error);
        }

        const tocPath = findFileByExt('toc');
        if (!tocPath) {
            const msg = `Could not find toc file at ${dir}`;
            log.error(msg);
            process.chdir(originalDir);
            return Promise.reject(new MissingFileError(msg));
        }

        const toePath = tocPath.replace(/\.toc$/, '');

        try {
            execSync(`toecollapse.exe ${toePath}`, {
                stdio: ['ignore', 'ignore', 'inherit'],
                windowsHide: true
            });
        } catch (error) {
            log.error(`Error collapsing ${tocPath}.`);
            process.chdir(originalDir);
            return Promise.reject(error);
        }

        const files = fs.readdirSync(dir);
        if (!files.find((file) => file === toePath)) {
            const msg = `Could not find toe file at ${dir}`;
            log.error(msg);
            process.chdir(originalDir);
            return Promise.reject(new MissingFileError(msg));
        }

        if (!outDir) {
            process.chdir(originalDir);
            return Promise.resolve([toePath]);
        }

        try {
            fs.moveSync(toePath, path.join(outDir, toePath), { overwrite: true });
        } catch (error) {
            log.error(`Error moving ${toePath} to ${outDir}`);
            process.chdir(originalDir);
            return Promise.reject(error);
        }

        process.chdir(originalDir);
        return Promise.resolve([path.join(outDir, toePath)]);
    }
}
