import { TDEdge } from '../../models/TDEdge';
import { InputRule } from './interfaces/InputRule';

export class ParmFileBasicOperatorRule implements InputRule {
    public name = 'ParmFileBasicOperatorRule';
    public description = 'Extracts input nodes from a TouchDesigner .parm file';

    private static readonly SINGLE_NODE_REGEX =
        /^(instanceop|lookat|envlightmap|material|lights|geometry)\s+67108864\s+(\w+)$/;
    private static readonly MULTIPLE_NODES_REGEX =
        /^(instanceop|lookat|envlightmap|material|lights|geometry)\s+67108864\s+["']?(\w+(?:,\s*\w+)*)["']?$/;

    public match(content: string): boolean {
        const lines = content.split('\n');
        return lines.some(
            (line) =>
                ParmFileBasicOperatorRule.SINGLE_NODE_REGEX.test(line) ||
                ParmFileBasicOperatorRule.MULTIPLE_NODES_REGEX.test(line)
        );
    }

    public extract(content: string): TDEdge[] {
        const inputLines = content.split('\n');
        const inputs: TDEdge[] = [];

        for (const line of inputLines) {
            let match = ParmFileBasicOperatorRule.SINGLE_NODE_REGEX.exec(line);
            if (match && match[2]) {
                inputs.push(new TDEdge(match[2], true));
            } else {
                match = ParmFileBasicOperatorRule.MULTIPLE_NODES_REGEX.exec(line);
                if (match && match[2]) {
                    const nodes = match[2].split(/\s*,\s*/);
                    nodes.forEach((node) => {
                        if (node) {
                            inputs.push(new TDEdge(node, true));
                        }
                    });
                }
            }
        }

        return inputs;
    }
}
