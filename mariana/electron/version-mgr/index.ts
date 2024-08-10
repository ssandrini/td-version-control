import path from 'path';
import simpleGit from 'simple-git';

export const listVersions = async () => {
    try {
        const tdDir = path.join('/home/jbrave/Desktop/ITBA/PF/td1/', '.td');
        const git = simpleGit(tdDir);
        const tags = await git.tags();
        if (tags.all.length === 0) {
            console.log('No versions found.');
            return [];
        } else {
            return tags.all;
        }
    } catch (error) {
        console.error('Error listing versions:', error);
        return [];
    }
};
