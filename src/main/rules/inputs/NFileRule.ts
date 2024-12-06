import { TDEdge } from '../../models/TDEdge';
import { InputRule } from './interfaces/InputRule';

export class NFileRule implements InputRule {
    public name = 'NFileRule';
    public description = 'Extracts input nodes from a TouchDesigner .n file.';

    private static readonly INPUTS_REGEX = /inputs\s*\{([^}]*)}/;

    public match(content: string): boolean {
        return NFileRule.INPUTS_REGEX.test(content);
    }

    public extract(content: string): TDEdge[] {
        const inputsSection = content.match(NFileRule.INPUTS_REGEX);
        if (!inputsSection) {
            return [];
        }

        return inputsSection[1]
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line)
            .map((line) => line.split(/\s+/))
            .filter((parts) => parts.length > 1 && parts[1])
            .map((parts) => {
                const inputName = parts[1].split('/')[0];
                return new TDEdge(inputName, false);
            });
    }
}
