import { dialog, shell } from 'electron';
import log from 'electron-log/main.js';
import fs from 'fs-extra';
import { stat, writeFile, readFile } from 'fs/promises';
import Template from '../models/Template';
import path from 'node:path';
import { TDState } from '../models/TDState';
import { app } from 'electron';
import { TagError } from '../errors/TagError';

/**
 * Searches for the first file in the current directory with the specified extension.
 * @param {string} ext - The file extension to search for (e.g., 'txt', 'json').
 * @param dir - optional dir
 * @returns {string | undefined} - The first matching file's name if found, otherwise undefined.
 */
export const findFileByExt = (ext: string, dir?: string): string | undefined => {
    const files = fs.readdirSync(dir ? dir : '.');
    const fileRegex = new RegExp(`\\.${ext}$`);
    return files.find((file) => fileRegex.test(file));
};

/**
 * Opens a file picker dialog for selecting a directory.
 * @returns {Promise<Electron.OpenDialogReturnValue>} - The result of the file picker dialog.
 */
export const filePicker = async (): Promise<Electron.OpenDialogReturnValue> => {
    log.info('Opening file picker dialog for directory selection.');
    return dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result) => {
        if (result.canceled) {
            log.info('File picker was canceled.');
        } else {
            log.info(`Directory selected: ${result.filePaths}`);
        }
        return result;
    });
};

/**
 * Retrieves a list of templates from the 'resources/templates' directory.
 * @returns {Promise<Template[]>} - A promise that resolves to an array of Template objects.
 */
export const getTemplates = async (): Promise<Template[]> => {
    const isDev = !app.isPackaged;
    const templatesListPath = isDev
        ? path.join(__dirname, '../../resources/templates')
        : path.join(process.resourcesPath, 'resources/templates');
    console.log('Templates Path:', templatesListPath);
    log.info(`Loading templates from path: ${templatesListPath}`);
    const templateDirs = await fs.promises.readdir(templatesListPath);
    const templates: Template[] = [];

    for (const dir of templateDirs) {
        const templatePath = path.join(templatesListPath, dir);
        log.info(`Processing template directory: ${dir}`);

        const stat = await fs.promises.stat(templatePath);
        if (!stat.isDirectory()) {
            log.warn(`Skipping non-directory: ${dir}`);
            continue;
        }

        try {
            const detailsPath = path.join(templatePath, 'details.json');
            const detailsData = await fs.promises.readFile(detailsPath, 'utf-8');
            const details = JSON.parse(detailsData);

            const imagePath = await getImageName(templatePath);

            templates.push({
                id: (details.id as string) || dir,
                dir: templatePath,
                name: (details.name as string) || 'Untitled',
                description: (details.description as string) || 'No description provided',
                imagePath: imagePath
            });

            log.info(`Template ${dir} loaded successfully.`);
        } catch (error) {
            log.error(`Error reading template ${dir}:`, error);
        }
    }

    return Promise.resolve(templates);
};

const getImageName = async (templatePath: string): Promise<string> => {
    const imageExtensions = ['.gif', '.png'];
    const folderName = path.basename(templatePath);
    log.info(`Searching for images in template folder: ${folderName}`);

    for (const ext of imageExtensions) {
        const imagePath = path.join(templatePath, `${folderName}${ext}`);
        const imageExists = await fs.promises
            .access(imagePath)
            .then(() => true)
            .catch(() => false);

        if (imageExists) {
            log.info(`Image found: ${imagePath}`);
            return Promise.resolve(`${folderName}${ext}`);
        }
    }

    log.warn(`No image found in template folder: ${folderName}`);
    return Promise.reject(new Error('No image found.'));
};

/**
 * Opens the first `.toe` file found in the specified project folder.
 *
 * @param {string} projectFolderPath - The path to the project folder where the .toe file is located.
 * @returns {Promise<void>} - A promise that resolves if the file opens successfully or rejects if an error occurs.
 * @throws {Error} - Throws an error if no .toe file is found or if the file fails to open.
 */
export const openToeFile = async (projectFolderPath: string): Promise<void> => {
    try {
        const files = await fs.readdir(projectFolderPath);

        const toeFile = files.find((file) => path.extname(file).toLowerCase() === '.toe');

        if (!toeFile) {
            log.error('No .toe file found in the project folder.');
            return Promise.reject(new Error('No .toe file found in the project folder.'));
        }

        const toeFilePath = path.join(projectFolderPath, toeFile);

        const result = await shell.openPath(toeFilePath);
        if (result) {
            log.error('Error opening .toe file:', result);
            return Promise.reject(new Error('Error opening .toe file.'));
        }

        log.info('.toe file opened successfully');

        // TO DO: delete?
        await new Promise((resolve) => setTimeout(resolve, 4000));

        return Promise.resolve();
    } catch (error) {
        log.error('Unexpected error:', error);
        return Promise.reject(new Error('Unexpected Error.'));
    }
};

/**
 * Extracts the name of the node, given a diff line of the toc file, ensuring it's within the specified container.
 *
 * @param {string} container - The name of the container to filter nodes.
 * @param {string} diffLine - A diff line from the toc file.
 * @returns {string | null} - The name of the node that changed, or empty string if not applicable.
 */
export const extractNodeNameFromToc = (container: string, diffLine: string): string => {
    const parts = diffLine.split('/');
    if (parts.length > 1 && parts[0] === container) {
        let nodeName = '';
        if (parts[1]) nodeName = parts[1].split('.')[0];
        return nodeName;
    }

    return '';
};

export const getNodeInfoFromNFile = (content: string): [string, string] | undefined => {
    const firstLine = content.split('\n')[0].trim();
    const [type, subtype] = firstLine.split(':');
    return [type.trim(), subtype.trim()];
};

export const findContainers = async (toeDir: string): Promise<string[]> => {
    const files = fs.readdirSync(toeDir);
    const containers: string[] = [];

    for (const file of files) {
        if (file.endsWith('.n')) {
            const filePath = path.join(toeDir, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const firstLine = fileContent.split('\n')[0];

            if (firstLine.includes('COMP:container')) {
                const nodeName = file.replace(/\.n$/, '');
                containers.push(nodeName);
            }
        }
    }

    return containers;
};

export const validateDirectory = async (dir: string): Promise<void> => {
    try {
        const stats = await fs.promises.stat(dir);
        if (!stats.isDirectory()) {
            const msg = `The path ${dir} is not a directory.`;
            log.error(msg);
            return Promise.reject(new TypeError(msg));
        }
    } catch (error) {
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            const msg = `The path ${dir} does not exist.`;
            log.error(msg);
            return Promise.reject(new TypeError(msg));
        }
        log.error(`Error validating directory ${dir}. Cause:`, error);
        return Promise.reject(error);
    }
};

export const dumpTDStateToFile = async (filePath: string, tdState: TDState): Promise<void> => {
    const data = JSON.stringify(tdState.serializeForFile(), null, 2);
    await fs.writeFile(filePath, data, 'utf8');
};

export const dumpDiffToFile = async (filePath: string, content: string): Promise<void> => {
    await fs.writeFile(filePath, content, 'utf8');
};

export const splitSet = (set: Set<[string, string]>): [string[], string[]] => {
    const firstElements: string[] = [];
    const secondElements: string[] = [];

    for (const [first, second] of set) {
        firstElements.push(first);
        secondElements.push(second);
    }

    return [firstElements, secondElements];
};

export const extractFileName = (filePath: string): string | null => {
    const match = filePath.match(/[^/\\]+$/);
    return match ? match[0] : null;
};

/**
 * Opens a directory in the system's file explorer (Explorer on Windows or Finder on macOS).
 *
 * @param {string} directoryPath - The path to the directory to be opened.
 * @returns {Promise<void>} - A promise that resolves if the directory opens successfully or rejects if an error occurs.
 * @throws {Error} - Throws an error if the directory fails to open.
 */
export const openDirectory = async (directoryPath: string): Promise<void> => {
    try {
        const absolutePath = path.resolve(directoryPath);

        const result = await shell.openPath(absolutePath);
        if (result) {
            log.error('Error opening directory:', result);
            return Promise.reject(new Error(`Error opening directory: ${result}`));
        }

        log.info('Directory opened successfully:', absolutePath);
        return Promise.resolve();
    } catch (error) {
        log.error('Unexpected error while opening directory:', error);
        return Promise.reject(new Error('Unexpected error while opening directory.'));
    }
};

export const validateTag = (tag: string): void => {
    const fail = (reason: string) => {
        throw new TagError(`Invalid tag "${tag}": ${reason}`);
    };

    const components = tag.split('/');
    if (components.length < 2) {
        fail('must contain at least one slash (/) to separate components.');
    }
    if (components.some((part) => part.startsWith('.') || part.endsWith('.lock'))) {
        fail(
            'no slash-separated component can begin with a dot (.) or end with the sequence ".lock".'
        );
    }

    if (tag.includes('..')) {
        fail('cannot contain two consecutive dots (..).');
    }

    // eslint-disable-next-line no-control-regex
    const invalidCharacters = new RegExp('[\\x00-\\x1F\\x7F ~^:?*\\[]');
    if (invalidCharacters.test(tag)) {
        fail(
            'cannot contain ASCII control characters, space, tilde (~), caret (^), colon (:), question mark (?), asterisk (*), or open bracket ([).'
        );
    }

    if (tag.startsWith('/')) {
        fail('cannot begin with a slash (/).');
    }
    if (tag.endsWith('/')) {
        fail('cannot end with a slash (/).');
    }
    if (tag.includes('//')) {
        fail('cannot contain multiple consecutive slashes (//).');
    }

    if (tag.endsWith('.')) {
        fail('cannot end with a dot (.).');
    }

    if (tag.includes('@{')) {
        fail('cannot contain the sequence "@{".');
    }

    if (tag === '@') {
        fail('cannot be the single character "@".');
    }

    if (tag.includes('.')) {
        fail('cannot contain a bare dot (.).');
    }
};

export const getLastModifiedDate = async (filePath: string): Promise<Date> => {
    try {
        const stats = await stat(filePath);
        return stats.mtime; // Modification time
    } catch (error: any) {
        throw new Error(
            `Unable to retrieve the last modified date for file "${filePath}": ${error.message}`
        );
    }
};

export const dumpTimestampToFile = async (date: Date, path: string): Promise<void> => {
    try {
        const dateString = date.toISOString();
        await writeFile(path, dateString, 'utf-8');
        log.debug(`Date ${dateString} written to file ${dateString} successfully.`);
    } catch (error: any) {
        log.error(`Failed to write date to file: ${error.message}`);
        throw new Error(`Error writing date to file at path "${path}": ${error.message}`);
    }
};

export const readDateFromFile = async (path: string): Promise<Date | undefined> => {
    let content: string;

    try {
        // Attempt to read the file content
        content = await readFile(path, 'utf-8');
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            log.warn(`File not found at path ${path}.`);
            return undefined;
        }
        log.error(`Unable to read content from ${path} due to:`, error.message);
        throw error;
    }

    const parsedDate = new Date(Date.parse(content.trim()));
    if (isNaN(parsedDate.getTime())) {
        log.error(`Invalid date format in file ${path}: ${content.trim()}`);
        throw new Error(`Invalid date format in file ${path}: ${content.trim()}`);
    }

    return parsedDate;
};
