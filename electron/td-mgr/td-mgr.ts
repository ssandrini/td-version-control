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
    
        return versions;
      };
    
    
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

    // Función para crear un proyecto donde ya hay un .toe existente.
    // Esta función debería llamarse al hacer Open de un proyecto, para validar
    // si es necesario empezar a generar versiones o ya tiene.



    // Función para crear una nueva versión

    // Función de checkout entre versiones

    // Función para obtener la versión actual de un proyecto.

}

export default new TouchDesignerManager();
