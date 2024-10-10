import { TDEdge } from "../../models/TDEdge";
import { InputRule } from "./interfaces/InputRule";

export class ParmFileChangeOperatorRule implements InputRule {
    public name = 'ParmFileChangeOperatorRule';
    public description = 
        'Extracts input nodes from a TouchDesigner .parm file by identifying operator transformations (e.g., top to sop, sop to chop) ' + 
        'formatted as "<operator> <number> <input>". This method parses each line in the content, looking for transformations of operators ' + 
        'and extracts the input (the third part of the line) whenever such a line is found.';

    private static readonly INPUT_LINE_REGEX = /^\s*(top|chop|sop)\s+\d+\s+(\w+)/;


    public match(content: string): boolean {
        return ParmFileChangeOperatorRule.INPUT_LINE_REGEX.test(content);
    }

    public extract(content: string): TDEdge[] {
        const inputLines = content.split('\n');
        const inputs: TDEdge[] = [];

        for (const line of inputLines) {
            const match = ParmFileChangeOperatorRule.INPUT_LINE_REGEX.exec(line);
            if (match) { // TODO: check duplicated edges
                inputs.push(new TDEdge(match[2], true));
            }
        }

        return inputs;
    }
}
