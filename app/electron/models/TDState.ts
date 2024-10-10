import { TDEdge } from "./TDEdge";
import { TDNode } from "./TDNode";
import fs from 'fs-extra';

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
    
    public async dumpToFile(filePath: string): Promise<void> {
        const data = JSON.stringify(this.serialize(), null, 2);
        await fs.writeFile(filePath, data, 'utf8');
    }

    public static async loadFromFile(content: string): Promise<TDState> {
        const parsedData = JSON.parse(content);
        return TDState.deserialize(parsedData);
    }
}
