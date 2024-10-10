import { TDEdge } from "../../models/TDEdge";
import { InputRule } from "./interfaces/InputRule";

export class ParmFileApplyOperatorRule implements InputRule {
    public name = 'ParmFileApplyOperatorRule';
    public description = 'Extracts input nodes from a TouchDesigner .parm file';

    private static readonly INPUT_LINE_REGEX = /op\('(\w+)'\)/;

    public match(content: string): boolean {
        return ParmFileApplyOperatorRule.INPUT_LINE_REGEX.test(content);
    }

    public extract(content: string): TDEdge[] {
        const inputLines = content.split('\n');
        const inputs: TDEdge[] = [];

        for (const line of inputLines) {
            const match = ParmFileApplyOperatorRule.INPUT_LINE_REGEX.exec(line);
            if (match) { // TODO: check duplicated edges
                inputs.push(new TDEdge(match[1], true));
            }
        }

        return inputs;
    }
}
