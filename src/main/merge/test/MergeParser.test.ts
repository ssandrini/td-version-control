import {
    parseMergeConflicts,
    preprocessMergeConflicts,
    resolveFileConflicts,
    resolveWithCurrentBranch,
    resolveWithIncomingBranch
} from '../MergeParser';
import { Content } from '../TrackerMergeResult';

describe('parseMergeConflicts', () => {
    it('should correctly parse a single conflict', () => {
        const fileContent: Content =
            'version 099\n<<<<<<< HEAD\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\n=======\n' +
            'build 2023.11880\ntime Sun Nov  3 12:34:06 2024\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75\n' +
            'osname Windows\nosversion 10';

        const conflicts = parseMergeConflicts(fileContent);

        expect(conflicts.size).toBe(1);
        // @ts-ignore
        const [conflict] = conflicts;
        expect(conflict).toEqual([
            'build 2023.11760\ntime Mon Nov  4 07:15:02 2024',
            'build 2023.11880\ntime Sun Nov  3 12:34:06 2024'
        ]);
    });

    it('should parse multiple conflicts in the same file', () => {
        const fileContent: Content =
            'version 099\n<<<<<<< HEAD\nbuild 2023.11760\n=======\nbuild 2023.11880\n>>>>>>> ' +
            'a94141e06f480d16f5e9a5e884bbd4a6481afd75\nosname Windows\n<<<<<<< HEAD\nosversion 10\n' +
            '=======\nosversion 11\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75';

        const conflicts = parseMergeConflicts(fileContent);

        expect(conflicts.size).toBe(2);
        const [firstConflict, secondConflict] = Array.from(conflicts);
        expect(firstConflict).toEqual(['build 2023.11760', 'build 2023.11880']);
        expect(secondConflict).toEqual(['osversion 10', 'osversion 11']);
    });
});

describe('resolveFileConflicts', () => {
    it('should resolve a single conflict by selecting leftContent', () => {
        const conflictedContent: Content =
            'version 099\n<<<<<<< HEAD\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\n=======\n' +
            'build 2023.11880\ntime Sun Nov  3 12:34:06 2024\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75\n' +
            'osname Windows\nosversion 10';
        const userInput: Content[] = ['build 2023.11760\ntime Mon Nov  4 07:15:02 2024'];

        const resolvedContent = resolveFileConflicts(conflictedContent, userInput);

        expect(resolvedContent).toContain('build 2023.11760');
        expect(resolvedContent).not.toContain('build 2023.11880');
        expect(resolvedContent).toContain('time Mon Nov  4 07:15:02 2024');
        expect(resolvedContent).toBe(
            'version 099\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\nosname Windows\nosversion 10'
        );
    });

    it('should resolve a single conflict by selecting rightContent', () => {
        const conflictedContent: Content =
            'version 099\n<<<<<<< HEAD\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\n=======\n' +
            'build 2023.11880\ntime Sun Nov  3 12:34:06 2024\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75\n' +
            'osname Windows\nosversion 10';
        const userInput: Content[] = ['build 2023.11880\ntime Sun Nov  3 12:34:06 2024'];

        const resolvedContent = resolveFileConflicts(conflictedContent, userInput);

        expect(resolvedContent).toContain('build 2023.11880');
        expect(resolvedContent).not.toContain('build 2023.11760');
        expect(resolvedContent).toContain('time Sun Nov  3 12:34:06 2024');
        expect(resolvedContent).toBe(
            'version 099\nbuild 2023.11880\ntime Sun Nov  3 12:34:06 2024\nosname Windows\nosversion 10'
        );
    });

    it('should resolve multiple conflicts within the same file', () => {
        const conflictedContent: Content =
            'version 099\n<<<<<<< HEAD\nbuild 2023.11760\n=======\nbuild 2023.11880\n>>>>>>> ' +
            'a94141e06f480d16f5e9a5e884bbd4a6481afd75\nosname Windows\n<<<<<<< HEAD\nosversion 10\n' +
            '=======\nosversion 11\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75';
        const userInput: Content[] = ['build 2023.11760', 'osversion 11'];

        const resolvedContent = resolveFileConflicts(conflictedContent, userInput);

        expect(resolvedContent).toContain('build 2023.11760');
        expect(resolvedContent).not.toContain('build 2023.11880');
        expect(resolvedContent).toContain('osversion 11');
        expect(resolvedContent).not.toContain('osversion 10');
        expect(resolvedContent).toBe('version 099\nbuild 2023.11760\nosname Windows\nosversion 11');
    });
});

describe('Automatic Conflict Resolution Functions', () => {
    const conflictedContent: Content =
        'version 099\n<<<<<<< HEAD\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\n=======\nbuild 2023.11880\ntime Sun Nov  3 12:34:06 2024\n>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75\nosname Windows\nosversion 10';

    test('resolveWithCurrentBranch - resolves conflicts choosing HEAD content', () => {
        const resolvedContent = resolveWithCurrentBranch(conflictedContent);

        const expectedContent =
            'version 099\nbuild 2023.11760\ntime Mon Nov  4 07:15:02 2024\nosname Windows\nosversion 10';

        expect(resolvedContent).toBe(expectedContent);
    });

    test('resolveWithIncomingBranch - resolves conflicts choosing Incoming content', () => {
        const resolvedContent = resolveWithIncomingBranch(conflictedContent);

        const expectedContent =
            'version 099\nbuild 2023.11880\ntime Sun Nov  3 12:34:06 2024\nosname Windows\nosversion 10';

        expect(resolvedContent).toBe(expectedContent);
    });

    // Additional test cases
    const additionalConflictContent =
        'appName TestApp\n<<<<<<< HEAD\nversion 1.0.0\nauthor Alice\n=======\nversion 1.1.0\nauthor Bob\n>>>>>>> b1c3d5f7e8a9d1c0f1e2a3b4c5d6e7f8g9h0\nplatform macOS';

    test('resolveWithCurrentBranch - resolves conflicts choosing HEAD content in another example', () => {
        const resolvedContent = resolveWithCurrentBranch(additionalConflictContent);

        const expectedContent = 'appName TestApp\nversion 1.0.0\nauthor Alice\nplatform macOS';

        expect(resolvedContent).toBe(expectedContent);
    });

    test('resolveWithIncomingBranch - resolves conflicts choosing Incoming content in another example', () => {
        const resolvedContent = resolveWithIncomingBranch(additionalConflictContent);

        const expectedContent = 'appName TestApp\nversion 1.1.0\nauthor Bob\nplatform macOS';

        expect(resolvedContent).toBe(expectedContent);
    });
});

describe('Conflict Resolution Functions with Multiple Conflicts', () => {
    const conflictedContent: Content =
        'version 099\n' +
        '<<<<<<< HEAD\n' +
        'build 2023.11760\n' +
        'time Mon Nov  4 07:15:02 2024\n' +
        '=======\n' +
        'build 2023.11880\n' +
        'time Sun Nov  3 12:34:06 2024\n' +
        '>>>>>>> a94141e06f480d16f5e9a5e884bbd4a6481afd75\n' +
        'osname Windows\n' +
        '<<<<<<< HEAD\n' +
        'osversion 10\n' +
        '=======\n' +
        'osversion 11\n' +
        '>>>>>>> b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0\n' +
        'platform x64\n' +
        '<<<<<<< HEAD\n' +
        'architecture AMD64\n' +
        '=======\n' +
        'architecture ARM64\n' +
        '>>>>>>> c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1\n' +
        'appName MyApplication\n' +
        '<<<<<<< HEAD\n' +
        'environment Development\n' +
        '=======\n' +
        'environment Production\n' +
        '>>>>>>> d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2';

    test('resolveWithCurrentBranch - resolves multiple conflicts choosing HEAD content', () => {
        const resolvedContent = resolveWithCurrentBranch(conflictedContent);
        const expectedContent =
            'version 099\n' +
            'build 2023.11760\n' +
            'time Mon Nov  4 07:15:02 2024\n' +
            'osname Windows\n' +
            'osversion 10\n' +
            'platform x64\n' +
            'architecture AMD64\n' +
            'appName MyApplication\n' +
            'environment Development';

        expect(resolvedContent).toBe(expectedContent);
    });

    test('resolveWithIncomingBranch - resolves multiple conflicts choosing Incoming content', () => {
        const resolvedContent = resolveWithIncomingBranch(conflictedContent);
        const expectedContent =
            'version 099\n' +
            'build 2023.11880\n' +
            'time Sun Nov  3 12:34:06 2024\n' +
            'osname Windows\n' +
            'osversion 11\n' +
            'platform x64\n' +
            'architecture ARM64\n' +
            'appName MyApplication\n' +
            'environment Production';

        expect(resolvedContent).toBe(expectedContent);
    });
});

describe('preprocessMergeConflicts', () => {
    const ignoreProperties = [/^pageindex\b/];

    test('conflicto con propiedades ignoradas sincronizadas', () => {
        const input = `
<<<<<<< HEAD
horzsource 67108864 none
pageindex 67108864 1
vertsource 67108864 red
=======
horzsource 67108864 asd
pageindex 67108864 2
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;
        const expectedOutput = `
<<<<<<< HEAD
horzsource 67108864 none
pageindex 67108864 1
vertsource 67108864 red
=======
horzsource 67108864 asd
pageindex 67108864 1
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;

        const result = preprocessMergeConflicts(input, ignoreProperties);
        expect(result.trim()).toBe(expectedOutput.trim());
    });

    test('conflicto solo con propiedades ignoradas (se elimina)', () => {
        const input = `
<<<<<<< HEAD
pageindex 67108864 1
=======
pageindex 67108864 2
>>>>>>> 21dasd123123
        `;
        const expectedOutput = `pageindex 67108864 1`;

        const result = preprocessMergeConflicts(input, ignoreProperties);
        expect(result.trim()).toBe(expectedOutput.trim());
    });

    test('conflicto sin propiedades ignoradas (se conserva)', () => {
        const input = `
<<<<<<< HEAD
vertsource 67108864 red
=======
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;
        const expectedOutput = `
<<<<<<< HEAD
vertsource 67108864 red
=======
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;

        const result = preprocessMergeConflicts(input, ignoreProperties);
        expect(result.trim()).toBe(expectedOutput.trim());
    });

    test('múltiples conflictos en un archivo', () => {
        const input = `
<<<<<<< HEAD
horzsource 67108864 none
pageindex 67108864 1
=======
horzsource 67108864 asd
pageindex 67108864 2
>>>>>>> 21dasd123123

<<<<<<< HEAD
vertsource 67108864 red
=======
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;
        const expectedOutput = `
<<<<<<< HEAD
horzsource 67108864 none
pageindex 67108864 1
=======
horzsource 67108864 asd
pageindex 67108864 1
>>>>>>> 21dasd123123

<<<<<<< HEAD
vertsource 67108864 red
=======
vertsource 67108864 blue
>>>>>>> 21dasd123123
        `;

        const result = preprocessMergeConflicts(input, ignoreProperties);
        expect(result.trim()).toBe(expectedOutput.trim());
    });
});
