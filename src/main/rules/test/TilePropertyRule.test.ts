import { TilePropertyRule } from '../properties/TilePropertyRule';

describe('TilePropertyRule', () => {
    let tileRule: TilePropertyRule;

    beforeEach(() => {
        tileRule = new TilePropertyRule();
    });

    test('should match lines that start with "tile"', () => {
        const matchingLine1 = 'tile 3150 850 130 105';
        const matchingLine2 = 'tile 1400 1600 130 105';
        const nonMatchingLine1 = 'flags = viewer 1 parlanguage 0';
        const nonMatchingLine2 = 'color 0.55 0.55 0.55';

        expect(tileRule.match(matchingLine1)).toBe(true);
        expect(tileRule.match(matchingLine2)).toBe(true);
        expect(tileRule.match(nonMatchingLine1)).toBe(false);
        expect(tileRule.match(nonMatchingLine2)).toBe(false);
    });

    test('should extract tile properties correctly', () => {
        const validLine = 'tile 3150 850 130 105';
        const nodeProperties = new Map<string, string>();

        tileRule.extract(validLine, nodeProperties);

        expect(nodeProperties.get('tileX')).toBe('3150');
        expect(nodeProperties.get('tileY')).toBe('850');
        expect(nodeProperties.get('sizeX')).toBe('130');
        expect(nodeProperties.get('sizeY')).toBe('105');
    });

    test('should not extract properties if the line is invalid', () => {
        const invalidLine1 = 'tile 3150 850 130';
        const invalidLine2 = 'tile 1400 1600 130 105 extra';
        const invalidLine3 = 'flags = viewer 1 parlanguage 0';
        const nodeProperties = new Map<string, string>();

        tileRule.extract(invalidLine1, nodeProperties);
        expect(nodeProperties.size).toBe(0);

        tileRule.extract(invalidLine2, nodeProperties);
        expect(nodeProperties.size).toBe(0);

        tileRule.extract(invalidLine3, nodeProperties);
        expect(nodeProperties.size).toBe(0);
    });
});
