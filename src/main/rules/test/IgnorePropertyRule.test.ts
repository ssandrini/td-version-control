import { IgnorePropertyRule } from '../properties/IgnorePropertyRule';

describe('IgnorePropertyRule', () => {
    let ignoreRule: IgnorePropertyRule;

    beforeEach(() => {
        ignoreRule = new IgnorePropertyRule(
            'IgnoreExample',
            'Rule to ignore specific properties',
            (line: string) => line.startsWith('ignore') // Criterio de coincidencia de ejemplo
        );
    });

    test('should match lines that start with "ignore"', () => {
        const matchingLine = 'ignore this property';
        const nonMatchingLine = 'do not ignore this property';

        expect(ignoreRule.match(matchingLine)).toBe(true);
        expect(ignoreRule.match(nonMatchingLine)).toBe(false);
    });

    test('should not extract properties', () => {
        const line = 'ignore this property';
        const nodeProperties = new Map<string, string>();

        ignoreRule.extract(line, nodeProperties);

        expect(nodeProperties.size).toBe(0);
    });
});
