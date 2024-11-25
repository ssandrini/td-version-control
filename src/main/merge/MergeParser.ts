import { Content } from './TrackerMergeResult';

const conflictRegex = /<<<<<<< HEAD\s*([\s\S]*?)\s*=======\s*([\s\S]*?)\s*>>>>>>> (\w+)/g;

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

export const preprocessMergeConflicts = (
    fileContent: Content,
    ignoreProperties: RegExp[]
): Content => {
    return fileContent.replace(
        conflictRegex,
        (_fullMatch, currentContent, incomingContent, commitHash) => {
            const currentLines = currentContent.trim().split('\n');
            const incomingLines = incomingContent.trim().split('\n');

            const ignoredLinesMap = new Map<string, string>();

            currentLines.forEach((line: string) => {
                if (ignoreProperties.some((regex) => regex.test(line))) {
                    const key = line.split(/\s+/)[0];
                    ignoredLinesMap.set(key, line);
                }
            });

            const synchronizedIncomingLines = incomingLines.map((line: string) => {
                const key = line.split(/\s+/)[0];
                return ignoredLinesMap.get(key) || line;
            });

            // Verificar si todas las líneas son ignoradas
            const isOnlyIgnored =
                currentLines.every((line: string) =>
                    ignoreProperties.some((regex) => regex.test(line))
                ) &&
                incomingLines.every((line: string) =>
                    ignoreProperties.some((regex) => regex.test(line))
                );

            if (isOnlyIgnored) {
                return currentContent.trim();
            }

            const updatedIncomingContent = synchronizedIncomingLines.join('\n');
            return `<<<<<<< HEAD\n${currentContent.trim()}\n=======\n${updatedIncomingContent}\n>>>>>>> ${commitHash}`;
        }
    );
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
