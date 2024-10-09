import { InputRule } from "./interfaces/InputRule";

export class NetworkFileRule implements InputRule {
    public name = 'NetworkFileRule';
    public description = 'Extracts input nodes from a TouchDesigner .network file by identifying the "compinputs" section and extracting node names.';

    private static readonly COMPINPUTS_REGEX = /compinputs\s*\{([^}]*)}/;

    public match(content: string): boolean {
        return NetworkFileRule.COMPINPUTS_REGEX.test(content);
    }

    public extract(content: string): string[] {
        const compInputsSection = content.match(NetworkFileRule.COMPINPUTS_REGEX);
        if (!compInputsSection) {
            return [];
        }

        return compInputsSection[1].trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && /^\d/.test(line))
            .map(line => {
                const parts = line.split(/\s+/);
                return parts[1];
            });
    }

}
