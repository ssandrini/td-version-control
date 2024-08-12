import path from 'path';
import simpleGit from 'simple-git';
import { dialog } from 'electron'

export const listVersions = async (dir: string): Promise<string[]> => {
    const tdDir = path.join(dir, '.td');
    const git = simpleGit(tdDir);
    return git.tags().then((tags) => {
        if (tags.all.length !== 0) {
            return tags.all;
        }
        return []
    });
};


export const filePicker = async (): Promise<Electron.OpenDialogReturnValue> => {
    return dialog.showOpenDialog({properties: ['openDirectory']}).then((result) => {
        return result;
    });
}
