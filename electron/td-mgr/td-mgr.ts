import { shell } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import simpleGit from 'simple-git';
import hidefile from 'hidefile'

class TouchDesignerManager {
    constructor() {}

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
        const originalDir = process.cwd()
        try {
            const filesInDestination = await fs.readdir(destinationPath);
            if (filesInDestination.length > 0) {
                console.error('Destination directory is not empty.');
                return false;
            }
            console.log(originalDir)
            const templatesPath = path.join(originalDir,'electron','td-mgr','assets','templates');
            const templatePath = path.join(templatesPath, templateName);
            console.log(templatePath)
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
                // ESTO NO DEBERÍA PASAR CREO
                console.log('Git repository already exists in .td');
            }

            const toeFile = "NewProject.toe"
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
                // qué hacer acá?
                console.error('No new .toe file found after collapse');
            }

            console.log('Project created successfully from template.');
            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
            return false;
        } finally {
            process.chdir(originalDir)
        }
    }

    private findToeFile(projectPath: string): string | undefined {
        const files = fs.readdirSync(projectPath);
        return files.find(file => path.extname(file).toLowerCase() === '.toe');
    }
}

export default new TouchDesignerManager();
