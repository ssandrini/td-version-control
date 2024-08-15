import { shell } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import simpleGit from 'simple-git';
import hidefile from 'hidefile';
import { dialog } from 'electron';

export interface Version {
    name: string;
    author: string;
    description: string;
    date: string;
    // TO DO: que otros campos hacen falta?
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
                console.error('No .toe file found in the project folder.');
                return false;
            }

            const toeFilePath = path.join(projectFolderPath, toeFile);

            // Intentar abrir el archivo .toe
            const result = await shell.openPath(toeFilePath);
            if (result) {
                console.error('Error opening .toe file:', result);
                return false;
            }

            console.log('.toe file opened successfully');
            
            // delay para que se vea mejor
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
            return false;
        }
    }

    public async createProjectFromTemplate(destinationPath: string, templateName: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const filesInDestination = await fs.readdir(destinationPath);
            if (filesInDestination.length > 0) {
                console.error('Destination directory is not empty.');
                return false;
            }

            const templatesPath = path.join(originalDir,'electron','td-mgr','assets','templates');
            const templatePath = path.join(templatesPath, templateName);
            if (!fs.existsSync(templatePath) || !(await fs.stat(templatePath)).isDirectory()) {
                console.error('Template folder does not exist.');
                return false;
            }

            const tdDir = path.join(destinationPath, '.td');
            await fs.mkdirSync(tdDir);
            hidefile.hideSync(tdDir);

            await fs.cpSync(templatePath, tdDir, { recursive: true });

            const git = simpleGit({ baseDir: tdDir });
            if (!fs.existsSync(path.join(tdDir, '.git'))) {
                await git.init();
                console.log('Initialized empty Git repository in .td');
            } else {
                console.log('Git repository already exists in .td');
            }

            const toeFile = "NewProject.toe";
            try {
                process.chdir(tdDir);
                await git.add('.');
                await git.commit('Initial version');
                await git.addAnnotatedTag("version0", "version0");
                execSync(`toecollapse.exe ${toeFile}`, { stdio: 'inherit' });
            } catch (e) {
                console.error('Error collapsing version:', e);
            }

            const newToeFile = this.findToeFile(tdDir);
            if (newToeFile) {
                const sourcePath = path.join(tdDir, newToeFile);
                const targetPath = path.join(destinationPath, newToeFile);
                fs.renameSync(sourcePath, targetPath);
            } else {
                console.error('No new .toe file found after collapse');
            }

            console.log('Project created successfully from template.');
            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
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
                console.error('No .toe file found in the destination folder.');
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
                console.log('Initialized empty Git repository in .td');
            } else {
                console.log('Git repository already exists in .td');
            }

            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: 'inherit' });
            } catch (e) {
                console.error("toeexpand failed: " + e)
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

            console.log('Project created successfully with existing .toe file.');
            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
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
                console.log('No .toe file found');
                return false;
            }

            process.chdir(projectPath);

            try {
                execSync(`toeexpand.exe ${toeFile}`, { stdio: 'inherit' });
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

            console.log(`Created new version: ${versionName}`);
        } catch (error) {
            console.error('Error creating new version:', error);
        } finally {
            process.chdir(originalDir);
        }
        return true;
    }

    // Función de checkout entre versiones
    public async checkoutVersion(versionName: string, projectPath: string): Promise<boolean> {
        const originalDir = process.cwd();
        try {
            const tdDir = path.join(projectPath, '.td');
            const git = simpleGit({ baseDir: tdDir });
    
            const tags = await git.tags();
            if (!tags.all.includes(versionName)) {
                console.log(`Version ${versionName} not found`);
                return false;
            }
    
            await git.checkout(versionName);
            var toeFile = this.findToeFile(projectPath)
            try {
                process.chdir(tdDir)
                execSync(`toecollapse.exe ${toeFile}`, { stdio: 'inherit' });
                console.log(`Collapsed to version ${versionName}`);
            } catch (e) {
                console.error('Error collapsing version:', e);
            }
    
            const newToeFile = this.findToeFile(projectPath)
            if (newToeFile) {
                const sourcePath = path.join(tdDir, newToeFile);
                const targetPath = path.join(projectPath, newToeFile);
                fs.renameSync(sourcePath, targetPath);
            } else {
                console.log('No new .toe file found after collapse');
                return false;
            } 
        } catch (error) {
            console.error('Error checking out version:', error);
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
            const [_, author, description, date] = commitData.split('|');

            const version: Version = {
                name: tagName.trim(),
                author: author || 'Unknown',
                description: description || 'No description',
                date: date || 'Unknown date',
            };

            return version;
        } catch (error) {
            console.error('Error getting current version:', error);
            return {
                name: 'Unknown',
                author: 'Unknown',
                description: 'Error retrieving version',
                date: 'Unknown',
            };
        }
    }
}

export default new TouchDesignerManager();
