import { NFileRule } from '../inputs/NFileRule';
import { TDEdge } from '../../models/TDEdge';

describe('NFileRule', () => {
    let rule: NFileRule;

    beforeEach(() => {
        rule = new NFileRule();
    });

    const content1 =
        'TOP:fit\ntile 3650 1600 130 105\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0 \tcross1\n}\ncolor 0.55 0.55 0.55 \nend';
    const content2 =
        'COMP:geo\nv 249.25 238.492 4.18908\ntile 5250 650 160 130\nflags =  current on viewer 1 render on pickable on parlanguage 0\ncolor 0.55 0.55 0.55 \nview 28 0.2 1 1 0 0 1 0 0 1 0.0101873 -0.291346 0.311102 1 0 0 0 0 1 0 0 0 0 1 0 -0.0101873 0.291346 -8.95872 1 16 1 1 1 195 4883 1 -1 1 1 11 0 0 0 3 0 1\nend';
    const content3 =
        'TOP:cross\ntile 3325 1575 130 105\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0 \tlookup1\n1 \tnoise8\n}\ncolor 0.55 0.55 0.55 \nend';

    test('should match content with inputs', () => {
        expect(rule.match(content1)).toBe(true);
        expect(rule.match(content3)).toBe(true);
        expect(rule.match(content2)).toBe(false);
    });

    test('should extract inputs correctly', () => {
        expect(rule.extract(content1)).toEqual([new TDEdge('cross1', false)]);
        expect(rule.extract(content2)).toEqual([]);
        expect(rule.extract(content3)).toEqual([
            new TDEdge('lookup1', false),
            new TDEdge('noise8', false)
        ]);
    });

    test('should match content with inputs block', () => {
        const content = 'inputs {\n0 moviefilein2\n}';
        expect(rule.match(content)).toBe(true);
    });

    test('should not match content without inputs block', () => {
        const content = 'tile 475 625 130 72';
        expect(rule.match(content)).toBe(false);
    });

    test('should extract simple inputs correctly', () => {
        const content = 'inputs {\n0 moviefilein2\n1 chopto2\n}';
        const expectedEdges = [new TDEdge('moviefilein2', false), new TDEdge('chopto2', false)];
        expect(rule.extract(content)).toEqual(expectedEdges);
    });

    test('should extract inputs with slashes correctly', () => {
        const content = 'inputs {\n0 geo1/out1\n}';
        const expectedEdges = [new TDEdge('geo1', false)];
        expect(rule.extract(content)).toEqual(expectedEdges);
    });

    test('should return an empty array if no inputs block is found', () => {
        const content = 'tile 475 625 130 72';
        expect(rule.extract(content)).toEqual([]);
    });

    test('should handle mixed formats in inputs block', () => {
        const content = 'inputs {\n0 moviefilein2\n1 geo1/out1\n2 chopto2\n}';
        const expectedEdges = [
            new TDEdge('moviefilein2', false),
            new TDEdge('geo1', false),
            new TDEdge('chopto2', false)
        ];
        expect(rule.extract(content)).toEqual(expectedEdges);
    });
});
