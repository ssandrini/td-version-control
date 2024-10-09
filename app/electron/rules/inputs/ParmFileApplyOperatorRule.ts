import { InputRule } from "./interfaces/InputRule";

export class ParmFileApplyOperatorRule implements InputRule {
    public name = 'ParmFileApplyOperatorRule';
    public description = 'Extracts input nodes from a TouchDesigner .parm file';

    private static readonly INPUT_LINE_REGEX = /op\('(\w+)'\)/;

    public match(content: string): boolean {
        return ParmFileApplyOperatorRule.INPUT_LINE_REGEX.test(content);
    }

    public extract(content: string): string[] {
        const inputLines = content.split('\n');
        const inputs: string[] = [];

        for (const line of inputLines) {
            const match = ParmFileApplyOperatorRule.INPUT_LINE_REGEX.exec(line);
            if (match && !inputs.includes(match[1])) {
                inputs.push(match[1]);
            }
        }

        return inputs;
    }
}
