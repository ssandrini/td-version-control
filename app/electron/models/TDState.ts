import { TDEdge } from "./TDEdge";
import { TDNode } from "./TDNode";

export class TDState {
    public nodes: TDNode[] = [];
    public inputs: Map<string, TDEdge[]> = new Map();

    constructor() {}

    public serialize(): object {
        return {
            nodes: this.nodes.map(node => node.serialize()),
            inputs: this.inputs
        };
    }

    public static deserialize(data: any): TDState {
        const state = new TDState();
        
        state.nodes = data.nodes.map((nodeData: any) => TDNode.deserialize(nodeData));
        state.inputs = data.inputs;

        return state;
    }

    public toString(): string {
        const nodesString = this.nodes.map(node => node.toString()).join(', ');

        const inputsString = Array.from(this.inputs.keys())
            .map(element => `${element}: [${this.inputs.get(element)?.map(e => `${e.destination} (${e.parm})`)?.join(', ')}]`)
            .join('; ');

        return `TDState { nodes: [${nodesString}], inputs: {${inputsString}} }`;
    }
}
