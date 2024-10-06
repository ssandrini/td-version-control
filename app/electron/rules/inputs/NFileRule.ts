import {InputRule} from "./interfaces/InputRule";

export class NFileRule implements InputRule {
    public name = 'NFileRule';
    public description = 'Extracts input nodes from a TouchDesigner .n file.';

    private static readonly INPUTS_REGEX = /inputs\s*\{([^}]*)}/;

    public match(content: string): boolean {
        return NFileRule.INPUTS_REGEX.test(content);
    }

    public extract(content: string): string[] {
        const inputsSection = content.match(NFileRule.INPUTS_REGEX);
        if (!inputsSection) {
            return [];
        }

        return inputsSection[1].trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => {
                const parts = line.split(/\s+/);
                return parts[1];
            });
    }
}
