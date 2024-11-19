import { dialog, shell } from 'electron';
import log from 'electron-log/main.js';
import fs from 'fs-extra';
import Template from '../models/Template';
import path from 'node:path';
import { TDState } from '../models/TDState';
import { Content, Filename } from '../merge/TrackerMergeResult';
import { app } from 'electron';

/**
 * Searches for the first file in the current directory with the specified extension.
 * @param {string} ext - The file extension to search for (e.g., 'txt', 'json').
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

export const extractNodeNameFromDiffLine = (container: string, diffLine: string): string => {
    //log.debug("extractnodenamefromdiffline: ", container, diffLine)
    const parts = diffLine.split(' ');
    if (parts.length > 2) {
        const pathA = parts[2];
        const pathParts = pathA.split('/');
        const containerIndex = pathParts.indexOf(container);
        if (containerIndex !== -1 && containerIndex + 1 < pathParts.length) {
            const nodeNameWithExt = pathParts[containerIndex + 1];
            return nodeNameWithExt.split('.')[0];
        }
    }
    return '';
};

/**
 * Gets the information of a given node
 *
 * @param {string} toeDir - The path to the base directory, as returned by toeexpand.
 * @param {string} container - The name of the container to search within.
 * @param {string} node - The name of the node.
 * @returns {Promise<string | undefined>} - Returns the first line of the node file or undefined if not found.
 */
export const getNodeInfo = async (
    toeDir: string,
    container: string,
    node: string
): Promise<[string, string] | undefined> => {
    try {
        const containerDir = path.join(toeDir, container);
        const nodePath = path.join(containerDir, `${node}.n`);
        const fileContent = await fs.readFile(nodePath, 'utf-8');
        return getNodeInfoFromNFile(fileContent);
    } catch (error) {
        return undefined;
    }
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

export const buildNodeMap = (
    inputMap: Map<Filename, Set<[Content, Content]>>
): Map<string, Set<[string, string]>> => {
    const outputMap = new Map<string, Set<[string, string]>>();
    for (const [filename, valueSet] of inputMap.entries()) {
        const nodeName = filename.split('.')[0];
        if (outputMap.has(nodeName)) {
            const existingSet = outputMap.get(nodeName)!;
            valueSet.forEach((item) => existingSet.add(item));
        } else {
            outputMap.set(nodeName, new Set(valueSet));
        }
    }
    return outputMap;
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
    const match = filePath.match(/[^\/\\]+$/);
    return match ? match[0] : null;
};
