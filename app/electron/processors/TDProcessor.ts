import { Processor } from './interfaces/Processor';
import log from 'electron-log/main';
import { findFileByExt } from '../utils/utils';
import { MissingFileError } from '../errors/MissingFileError';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import path from 'node:path';

export class TDProcessor implements Processor {
    async preprocess(dir: string, outDir?: string): Promise<string[]> {
        try {
            process.chdir(dir);
        } catch (error) {
            log.error(`Error changing directory to ${dir}.`)
            Promise.reject(error);
        }
        log.debug('Current dir:', process.cwd());
        const toePath = findFileByExt('toe');
        if (toePath === undefined) {
            const msg = `No toe file found in project dir (${dir}).`;
            log.error(msg);
            Promise.reject(new MissingFileError(msg));
        }

        try {
            execSync(`toeexpand.exe ${toePath}`, { stdio: ['ignore', 'ignore', 'inherit']});
        } catch (error) {
            log.error(`Error expanding ${toePath}.`);
            Promise.reject(error);
        }
        log.debug(`Expanded ${toePath} to ${dir}`);

        const tocPath = `${toePath}.toc`;
        const dirPath = `${toePath}.dir`;

        const files = fs.readdirSync(dir);
        if (files.filter(file => file === tocPath || file === dirPath).length != 2) {
            log.error(`Missing ${tocPath} or ${dirPath} in ${dir}`);
            return Promise.reject(new MissingFileError(`Could not find ${tocPath} or ${dirPath}`));
        }
        
        if (outDir) {
            try {
                await Promise.all([
                    fs.move(tocPath, outDir),
                    fs.move(dirPath, outDir),
                ]);
            } catch(error) {
                log.error(`Error moving ${tocPath} and ${dirPath} to ${outDir}`);
                return Promise.reject(error);
            }
        }
        log.debug(`${toePath} expanded and moved to ${path.join(dir, outDir!)} succesfully.`);
        return Promise.resolve([tocPath, dirPath]);
    }

    postprocess(dir: string, outDir?: string): Promise<string[]> {
        try {
            process.chdir(dir);
        } catch (error) {
            log.error(`Error changing directory to ${dir}.`)
            return Promise.reject(error);
        }
        log.debug(`Current dir: ${dir}`);

        const tocPath = findFileByExt('toc');
        if(!tocPath) {
            const msg = `Could not find toc file at ${dir}`;
            log.error(msg);
            return Promise.reject(new MissingFileError(msg));
        }

        const toePath = tocPath.replace(/\.toc$/, '');

        try {
            execSync(`toecollapse.exe ${toePath}`, { stdio: ['ignore', 'ignore', 'inherit']});
        } catch (error) {
            log.error(`Error collapsing ${tocPath}.`);
            Promise.reject(error);
        }

        const files = fs.readdirSync(dir);
        if (!files.find(file => file === toePath)) {
            const msg = `Could not find toe file at ${dir}`;
            log.error(msg);
            return Promise.reject(new MissingFileError(msg));
        }

        if(!outDir) {
            return Promise.resolve([toePath]);
        }

        try {
            fs.moveSync(toePath, outDir);
        } catch(error) {
            log.error(`Error moving ${toePath} to ${outDir}`);
            return Promise.reject(error);
        }

        return Promise.resolve([path.join(outDir, toePath)]);

    }
}