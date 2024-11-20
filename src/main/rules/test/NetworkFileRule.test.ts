import { NetworkFileRule } from '../inputs/NetworkFileRule';
import { TDEdge } from '../../models/TDEdge';

describe('NetworkFileRule', () => {
    const rule = new NetworkFileRule();

    it('should extract input nodes from valid .net file content', () => {
        const content = '1\ncompinputs\n{\n0  null5\n in1\n SOP\n}\nend';
        const expectedInputs = [new TDEdge('null5', false)];
        const actualInputs = rule.extract(content);
        expect(actualInputs).toEqual(expectedInputs);
    });

    it('should return an empty array when no compinputs section is found', () => {
        const content = '1\nsometext\n{\n}\nend';
        const result = rule.extract(content);
        expect(result).toEqual([]);
    });

    it('should match content with a compinputs section', () => {
        const content = '1\ncompinputs\n{\n0  null5\n}\nend';
        expect(rule.match(content)).toBe(true);
    });

    it('should not match content without a compinputs section', () => {
        const content = '1\nsomethingelse\n{\n0  null5\n}\nend';
        expect(rule.match(content)).toBe(false);
    });
});
