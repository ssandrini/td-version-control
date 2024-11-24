import { ParmFileBasicOperatorRule } from '../inputs/ParmFileBasicOperatorRule';
import { TDEdge } from '../../models/TDEdge';

describe('ParmFileBasicOperatorRule', () => {
    const rule = new ParmFileBasicOperatorRule();

    // Helper function to avoid repetition
    const runExtractTest = (content: string, expected: TDEdge[]) => {
        const result = rule.extract(content.trim());
        expect(result).toEqual(expected);
    };

    it('should extract input nodes from valid .parm content', () => {
        const content1 = `?
pageindex 67108864 1
pxform 67108864 on
material 67108864 pbr1
?`;

        const content2 = `?
pageindex 67108864 2
tx 67108864 0
lookat 67108864 null14
?`;

        const expectedInputs = [[new TDEdge('pbr1', true)], [new TDEdge('null14', true)]];

        runExtractTest(content1, expectedInputs[0]);
        runExtractTest(content2, expectedInputs[1]);
    });

    it('should return an empty array when no matching lines are found', () => {
        const content = `?
tx 67108864 0
ty 67108864 0
shadowtype 67108864 soft2d
?`;
        runExtractTest(content, []);
    });

    // Helper function for matching tests
    const runMatchTest = (content: string, shouldMatch: boolean) => {
        const result = rule.match(content.trim());
        expect(result).toBe(shouldMatch);
    };

    it('should match valid content', () => {
        const validContent = `?
ty 67108864 0
material 67108864 pbr1
ty 67108864 0
?`;
        runMatchTest(validContent, true);
    });

    it('should not match invalid content', () => {
        const invalidContent = `?
tx 67108864 0
shadowtype 67108864 soft2d
?`;
        runMatchTest(invalidContent, false);
    });

    it('should extract input nodes from valid .parm content (single node)', () => {
        const content = `material 67108864 light1`;
        runExtractTest(content, [new TDEdge('light1', true)]);
    });

    it('should extract input nodes from valid .parm content (multiple nodes)', () => {
        const content = `material 67108864 "light1, environment1"`;
        runExtractTest(content, [new TDEdge('light1', true), new TDEdge('environment1', true)]);
    });

    it('should return an empty array when no matching lines are found', () => {
        const content = `?\npageindex 67108864 1\n?`;
        runExtractTest(content, []);
    });

    it('should match valid content with multiple nodes', () => {
        const validContent = `material 67108864 "light1, environment1"`;
        runMatchTest(validContent, true);
    });

    it('should match valid content with a single node', () => {
        const validContent = `material 67108864 light1`;
        runMatchTest(validContent, true);
    });

    it('should not match invalid content', () => {
        const invalidContent = `?\nchop 67108864 noise1\n?`;
        runMatchTest(invalidContent, false);
    });

    it('should not match invalid operator', () => {
        const invalidContent = `randomoperator 67108864 light1`;
        runMatchTest(invalidContent, false);
    });
});
