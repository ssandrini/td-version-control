import { Content } from './TrackerMergeResult';

const conflictRegex = /<<<<<<< HEAD\s*([\s\S]*?)\s*=======\s*([\s\S]*?)\s*>>>>>>> \w+/g;

export const parseMergeConflicts = (fileContent: Content): Set<[Content, Content]> => {
    const conflicts = new Set<[Content, Content]>();
    let match: RegExpExecArray | null;

    while ((match = conflictRegex.exec(fileContent)) !== null) {
        const leftContent = match[1].trim();
        const rightContent = match[2].trim();
        conflicts.add([leftContent, rightContent]);
    }

    return conflicts;
};

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const resolveFileConflicts = (conflictedContent: Content, userInput: Content[]): Content => {
    const mergeConflicts = parseMergeConflicts(conflictedContent);

    mergeConflicts.forEach(([leftContent, rightContent]) => {
        const selectedContent = userInput.includes(leftContent) ? leftContent : rightContent;
        const escapedLeftContent = escapeRegExp(leftContent);
        const escapedRightContent = escapeRegExp(rightContent);

        conflictedContent = conflictedContent.replace(
            new RegExp(
                `<<<<<<< HEAD\\s*${escapedLeftContent}\\s*=======\\s*${escapedRightContent}\\s*>>>>>>> \\w+`,
                'g'
            ),
            selectedContent
        );
    });

    return conflictedContent;
};

export const resolveWithCurrentBranch = (conflictedContent: Content): Content => {
    return conflictedContent.replace(conflictRegex, (_, leftContent) => leftContent.trim());
};

export const resolveWithIncomingBranch = (conflictedContent: Content): Content => {
    return conflictedContent.replace(conflictRegex, (_, __, rightContent) => rightContent.trim());
};
