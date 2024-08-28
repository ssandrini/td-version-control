import fs from 'fs-extra';

/**
 * 
 * @param ext File extenstion to search for
 * @returns File matching the extension if exists
 */
export const findFileByExt = (ext: string): string | undefined => {
    const files = fs.readdirSync('.');
    const fileRegex = new RegExp(`^[^.]+\\.${ext}$`);
    return files.find(file => fileRegex.test(file));
}