import { TDNode } from "./TDNode";

export class TDState {
    public nodes: TDNode[] = [];
    public inputs: Map<string, string[]> = new Map();

    constructor() {}

    public serialize(): object {
        return {
            nodes: this.nodes.map(node => node.serialize()),
            inputs: Array.from(this.inputs.entries()).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as { [key: string]: string[] })
        };
    }

    public static deserialize(data: any): TDState {
        const state = new TDState();
        
        state.nodes = data.nodes.map((nodeData: any) => TDNode.deserialize(nodeData));
        state.inputs = new Map(Object.entries(data.inputs));

        return state;
    }

    public toString(): string {
        const nodesString = this.nodes.map(node => node.toString()).join(', ');

        const inputsString = Array.from(this.inputs.keys())
            .map(element => `${element}: [${this.inputs.get(element)?.join(', ')}]`)
            .join('; ');

        return `TDState { nodes: [${nodesString}], inputs: {${inputsString}} }`;
    }
}
