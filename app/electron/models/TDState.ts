import { TDNode } from "./TDNode";

export class TDState {
    public nodes: TDNode[] = [];
    public inputs: Map<string, string[]> = new Map();

    constructor() {}

    public toString(): string {
        const nodesString = this.nodes.map(node => node.toString()).join(', ');

        const inputsString = Array.from(this.inputs.keys())
            .map(element => `${element}: [${this.inputs.get(element)?.join(', ')}]`)
            .join('; ');

        return `TDState { nodes: [${nodesString}], inputs: {${inputsString}} }`;
    }
}
