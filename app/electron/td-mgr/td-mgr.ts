import { shell } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import simpleGit from 'simple-git';
import hidefile from 'hidefile';
import { dialog } from 'electron';
import log from 'electron-log/main';
import Template from '../../src/models/Template';

export interface Version {
    name: string;
    author: string;
    description: string;
    date: string;
}

class TouchDesignerManager {
    constructor() {}

    public listVersions = async (dir: string): Promise<Version[]> => {
        const tdDir = path.join(dir, '.td');
        const git = simpleGit(tdDir);
    
        const tags = await git.tags();
        const versions: Version[] = [];
    
        for (const tagName of tags.all) {
            // Obtiene la información del commit asociado al tag
            const commitData = await git.show([`${tagName}`, '--pretty=format:%H|%an|%s|%ad', '--no-patch']);
            const [_, author, description, date] = commitData.split('|');
    
            const version: Version = {
                name: tagName,
                author: author || 'Unknown',
                description: description || 'No description',
                date: date || 'Unknown date',
            };
    
            versions.push(version);
        }
    
        versions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
        return versions;
    };
       
    
    // TO DO: esta función no pertenece acá, tirarla en un Utils
    public filePicker = async (): Promise<Electron.OpenDialogReturnValue> => {
        return dialog.showOpenDialog({properties: ['openDirectory']}).then((result) => {
            return result;
        });
    }

    public async openToeFile(projectFolderPath: string): Promise<boolean> {
        try {
            // Leer el contenido de la carpeta
            const files = await fs.readdir(projectFolderPath);

            // Buscar un archivo con extensión .toe
            const toeFile = files.find(file => path.extname(file).toLowerCase() === '.toe');

            if (!toeFile) {
                log.error('No .toe file found in the project folder.');
                return false;
            }

            const toeFilePath = path.join(projectFolderPath, toeFile);

            // Intentar abrir el archivo .toe
            const result = await shell.openPath(toeFilePath);
            if (result) {
                log.error('Error opening .toe file:', result);
                return false;
            }

            log.info('.toe file opened successfully');
            
            // delay para que se vea mejor
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            return true;
        } catch (error) {
            log.error('Unexpected error:', error);
            return false;
        }
    }

    public async createProjectFromTemplate(destinationPath: string, templateName: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const filesInDestination = await fs.readdir(destinationPath);
            if (filesInDestination.length > 0) {
                log.error('Destination directory is not empty.');
                return false;
            }

            const templatesListPath = path.join('resources','templates');
            const templatePath = path.join(templatesListPath, templateName);
            if (!fs.existsSync(templatePath) || !(await fs.stat(templatePath)).isDirectory()) {
                log.error(`Template ${templatePath} does not exist`);
                return false;
            }

            const toeFile = this.findToeFile(templatePath);
            if (toeFile == undefined) {
                log.error("Toe file not found at template folder");
                return false;
            }

            const tdDir = path.join(destinationPath, '.td');
            await fs.mkdirSync(tdDir);
            hidefile.hideSync(tdDir);
            
            await fs.cpSync(path.join(templatePath, toeFile), path.join(tdDir, toeFile));

            process.chdir(tdDir);
            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: ['ignore', 'ignore', 'inherit'] });
            } catch (e) {
                log.error("toeexpand failed: " + e)
            }
            const oldToePath = path.join(tdDir, toeFile);
            log.debug(`renaming ${oldToePath} to ${destinationPath}`)
            await fs.renameSync(oldToePath, path.join(destinationPath, toeFile));

            const git = simpleGit();
            if (!fs.existsSync(path.join(tdDir, '.git'))) {
                await git.init();
                log.info('Initialized empty Git repository in .td');
            } else {
                log.warn('Git repository already exists in .td');
            }
            try {
                await git.add('.');
                await git.commit('Initial version');
                await git.addAnnotatedTag("version0", "version0");
            } catch (e) {
                log.error('Error creating version0:', e);
            }

            log.info('Project created successfully from template.');
            return true;
        } catch (error) {
            log.error('Unexpected error:', error);
            return false;
        } finally {
            process.chdir(originalDir);
        }
    }

    private findToeFile(projectPath: string): string | undefined {
        const files = fs.readdirSync(projectPath);
        return files.find(file => path.extname(file).toLowerCase() === '.toe');
    }

    public async initializeProjectWithExistingToe(destinationPath: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const toeFile = this.findToeFile(destinationPath);
            if (!toeFile) {
                log.error('No .toe file found in the destination folder.');
                return false;
            }

            const tdDir = path.join(destinationPath, '.td');
            if (!fs.existsSync(tdDir)) {
                await fs.mkdirSync(tdDir);
                hidefile.hideSync(tdDir);
            }

            const git = simpleGit({ baseDir: tdDir });
            if (!fs.existsSync(path.join(tdDir, '.git'))) {
                await git.init();
                log.info('Initialized empty Git repository in .td');
            } else {
                log.warn('Git repository already exists in .td');
            }

            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: ['ignore', 'ignore', 'inherit'] });
            } catch (e) {
                log.error("toeexpand failed: " + e)
            }

            const expandedFiles = fs.readdirSync('.').filter(file => file !== '.td' && path.extname(file).toLowerCase() !== ".toe" && file !== 'Backup');
            for (const file of expandedFiles) {
                const targetPath = path.join(tdDir, file);
                fs.renameSync(file, targetPath);
            }

            process.chdir(tdDir);
            await git.add('.');
            await git.commit('Initial commit');
            await git.addAnnotatedTag("version0", "Initial version");

            log.info('Project created successfully with existing .toe file.');
            return true;
        } catch (error) {
            log.error('Unexpected error:', error);
            return false;
        } finally {
            process.chdir(originalDir);
        }
    }

    public async createNewVersion(versionName: string, versionDescription: string, projectPath: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const toeFile = this.findToeFile(projectPath);
            if (!toeFile) {
                log.error('No .toe file found');
                return false;
            }

            process.chdir(projectPath);

            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: ['ignore', 'ignore', 'inherit'] });
            } catch (e) {
                // tira error pero anda bien
            }

            const tocFilePath = `${toeFile}.toc`;
            const tocContent = fs.readFileSync(tocFilePath, 'utf-8');
            const fileList = tocContent.split('\n').map(line => line.trim()).filter(line => line !== '');

            const tdDir = path.join(projectPath, '.td');
            if (!fs.existsSync(tdDir)) {
                fs.mkdirSync(tdDir);
            }

            for (const file of fileList) {
                const sourcePath = path.join(process.cwd(), `${toeFile}.dir`, file);
                const targetPath = path.join(tdDir, `${toeFile}.dir`, file);
                fs.renameSync(sourcePath, targetPath);
            }

            const tocTargetPath = path.join(tdDir, path.basename(tocFilePath));
            fs.renameSync(tocFilePath, tocTargetPath);

            const toeDirPath = path.join(process.cwd(), `${toeFile}.dir`);
            fs.rm(toeDirPath, { recursive: true, force: true });

            process.chdir(tdDir);
            const git = simpleGit();
            await git.add('.');
            await git.commit(versionDescription);
            await git.addAnnotatedTag(versionName, versionDescription);

            log.info(`Created new version: ${versionName}`);
        } catch (error) {
            log.error('Error creating new version:', error);
        } finally {
            process.chdir(originalDir);
        }
        return true;
    }

    public async checkoutVersion(versionName: string, projectPath: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const tdDir = path.join(projectPath, '.td');
            const git = simpleGit({ baseDir: tdDir });
    
            const tags = await git.tags();
            if (!tags.all.includes(versionName)) {
                log.warn(`Version ${versionName} not found`);
                return false;
            }
    
            await git.checkout(versionName);
            const toeFile = this.findToeFile(projectPath)
            try {
                process.chdir(tdDir)
                execSync(`toecollapse.exe ${toeFile}`, { stdio: 'inherit' });
                log.info(`Collapsed to version ${versionName}`);
            } catch (e) {
                log.error('Error collapsing version:', e);
            }
    
            const newToeFile = this.findToeFile(projectPath)
            if (newToeFile) {
                const sourcePath = path.join(tdDir, newToeFile);
                const targetPath = path.join(projectPath, newToeFile);
                fs.renameSync(sourcePath, targetPath);
            } else {
                log.info('No new .toe file found after collapse');
                return false;
            } 
        } catch (error) {
            log.error('Error checking out version:', error);
        } finally {
            process.chdir(originalDir)
        }
        return true;
    }

    public async getCurrentVersion(projectPath: string): Promise<Version> {
        const tdDir = path.join(projectPath, '.td');
        const git = simpleGit({ baseDir: tdDir });
        try {
            const tagName = await git.raw(['describe', '--tags', '--abbrev=0']);
            const commitData = await git.show([`${tagName.trim()}`, '--pretty=format:%H|%an|%s|%ad', '--no-patch']);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, author, description, date] = commitData.split('|');

            const version: Version = {
                name: tagName.trim(),
                author: author || 'Unknown',
                description: description || 'No description',
                date: date || 'Unknown date',
            };

            return version;
        } catch (error) {
            log.error('Error getting current version:', error);
            return {
                name: 'Unknown',
                author: 'Unknown',
                description: 'Error retrieving version',
                date: 'Unknown',
            };
        }
    }

    public async getTemplates(): Promise<Template[]> {
        const templatesListPath = path.join('resources', 'templates');
        const templateDirs = await fs.promises.readdir(templatesListPath);
        const templates: Template[] = [];

        for (const dir of templateDirs) {
            const templatePath = path.join(templatesListPath, dir);

            const stat = await fs.promises.stat(templatePath);
            if (!stat.isDirectory()) continue;

            try {
                const detailsPath = path.join(templatePath, 'details.json');
                const detailsData = await fs.promises.readFile(detailsPath, 'utf-8');
                const details = JSON.parse(detailsData);

                const imagePath = await this.getImagePath(templatePath);

                templates.push({
                    id: details.id as string || dir,
                    dir: templatePath,
                    name: details.name as string || "Untitled",
                    description: details.description as string || "No description provided",
                    imagePath: imagePath,
                });
            } catch (error) {
                log.error(`Error reading template ${dir}:`, error);
            }
        }

        return templates;
    }

    private async getImagePath(templatePath: string): Promise<string | undefined> {
        const imageExtensions = ['.gif', '.png'];
        for (const ext of imageExtensions) {
            const imagePath = path.join(templatePath, `image${ext}`);
            const imageExists = await fs.promises.access(imagePath).then(() => true).catch(() => false);
            if (imageExists) {
                return imagePath;
            }
        }
        return undefined;
    }
}

export default new TouchDesignerManager();
