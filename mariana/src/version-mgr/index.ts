import path from 'path';
import simpleGit from 'simple-git';

export const listVersions = async () => {
    try {
        const tdDir = path.join(process.cwd(), '.td');
        const git = simpleGit(tdDir);
        const tags = await git.tags();
        if (tags.all.length === 0) {
            console.log('No versions found.');
        } else {
            console.log('Available versions:');
            tags.all.forEach(tag => console.log(tag));
        }
    } catch (error) {
        console.error('Error listing versions:', error);
    }
};
