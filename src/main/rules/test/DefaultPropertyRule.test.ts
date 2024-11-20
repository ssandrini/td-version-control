import { DefaultPropertyRule } from '../properties/DefaultPropertyRule';

describe('DefaultPropertyRule', () => {
    let rule: DefaultPropertyRule;
    let nodeProperties: Map<string, string>;

    beforeEach(() => {
        rule = new DefaultPropertyRule();
        nodeProperties = new Map<string, string>();
    });

    test('should match valid property lines', () => {
        const validLine1 = 'dat 67108864 ramp1_keys';
        const validLine2 = 'color1 67108864 0.853904';
        const validLine3 = 'combineinput 67108864 res';
        const invalidLine = 'size 67108864';

        expect(rule.match(validLine1)).toBe(true);
        expect(rule.match(validLine2)).toBe(true);
        expect(rule.match(validLine3)).toBe(true);
        expect(rule.match(invalidLine)).toBe(false);
    });

    test('should extract properties correctly', () => {
        const line1 = 'color1 67108864 0.853904';
        const line2 = "centerx 67108881 0 op('null3')['tx']";

        rule.extract(line1, nodeProperties);
        rule.extract(line2, nodeProperties);

        expect(nodeProperties.has('color1')).toBe(true);
        expect(nodeProperties.get('color1')).toBe('0.853904');

        expect(nodeProperties.has('centerx')).toBe(false);
    });

    test('should handle multiple properties', () => {
        const lines = [
            'radiusx 67108864 0.08',
            'radiusy 67108864 0.08',
            "resolutionw 67108881 1000 op('constant2')['X']"
        ];

        for (const line of lines) {
            rule.extract(line, nodeProperties);
        }

        expect(nodeProperties.has('radiusx')).toBe(true);
        expect(nodeProperties.get('radiusx')).toBe('0.08');

        expect(nodeProperties.has('radiusy')).toBe(true);
        expect(nodeProperties.get('radiusy')).toBe('0.08');

        expect(nodeProperties.has('resolutionw')).toBe(false);
    });
});
