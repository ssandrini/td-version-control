import { NFileRule } from '../NFileRule';
import { TDEdge } from '../../../models/TDEdge';

describe('NFileRule', () => {
    let nFileRule: NFileRule;

    beforeEach(() => {
        nFileRule = new NFileRule();
    });

    it('should match content with inputs block', () => {
        const content = 'inputs {\n0 moviefilein2\n}';
        expect(nFileRule.match(content)).toBe(true);
    });

    it('should not match content without inputs block', () => {
        const content = 'tile 475 625 130 72';
        expect(nFileRule.match(content)).toBe(false);
    });

    it('should extract simple inputs correctly', () => {
        const content = 'inputs {\n0 moviefilein2\n1 chopto2\n}';
        const expectedEdges = [new TDEdge('moviefilein2', false), new TDEdge('chopto2', false)];
        expect(nFileRule.extract(content)).toEqual(expectedEdges);
    });

    it('should extract inputs with slashes correctly', () => {
        const content = 'inputs {\n0 geo1/out1\n}';
        const expectedEdges = [new TDEdge('geo1', false)];
        expect(nFileRule.extract(content)).toEqual(expectedEdges);
    });

    it('should return an empty array if no inputs block is found', () => {
        const content = 'tile 475 625 130 72';
        expect(nFileRule.extract(content)).toEqual([]);
    });

    it('should handle mixed formats in inputs block', () => {
        const content = 'inputs {\n0 moviefilein2\n1 geo1/out1\n2 chopto2\n}';
        const expectedEdges = [
            new TDEdge('moviefilein2', false),
            new TDEdge('geo1', false),
            new TDEdge('chopto2', false)
        ];
        expect(nFileRule.extract(content)).toEqual(expectedEdges);
    });
});
