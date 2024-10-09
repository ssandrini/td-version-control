import {NFileRule} from "../inputs/NFileRule";

describe('NFileRule', () => {
    let rule: NFileRule;

    beforeEach(() => {
        rule = new NFileRule();
    });

    const content1 = "TOP:fit\ntile 3650 1600 130 105\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0 \tcross1\n}\ncolor 0.55 0.55 0.55 \nend";
    const content2 = "COMP:geo\nv 249.25 238.492 4.18908\ntile 5250 650 160 130\nflags =  current on viewer 1 render on pickable on parlanguage 0\ncolor 0.55 0.55 0.55 \nview 28 0.2 1 1 0 0 1 0 0 1 0.0101873 -0.291346 0.311102 1 0 0 0 0 1 0 0 0 0 1 0 -0.0101873 0.291346 -8.95872 1 16 1 1 1 195 4883 1 -1 1 1 11 0 0 0 3 0 1\nend";
    const content3 = "TOP:cross\ntile 3325 1575 130 105\nflags =  viewer 1 parlanguage 0\ninputs\n{\n0 \tlookup1\n1 \tnoise8\n}\ncolor 0.55 0.55 0.55 \nend";

    test('should match content with inputs', () => {
        expect(rule.match(content1)).toBe(true);
        expect(rule.match(content3)).toBe(true);
        expect(rule.match(content2)).toBe(false);
    });

    test('should extract inputs correctly', () => {
        expect(rule.extract(content1)).toEqual(['cross1']);
        expect(rule.extract(content2)).toEqual([]);
        expect(rule.extract(content3)).toEqual(['lookup1', 'noise8']);
    });
});
