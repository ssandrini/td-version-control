import { shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';

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
            return true;
        } catch (error) {
            console.error('Unexpected error:', error);
            return false;
        }
    }
}

export default new TouchDesignerManager();
