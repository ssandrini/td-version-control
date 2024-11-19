import { TDEdge } from './TDEdge';
import { TDNode } from './TDNode';

export class TDState {
    public nodes: TDNode[] = [];
    public inputs: Map<string, TDEdge[]> = new Map();

    constructor() {}

    public serialize(): object {
        return {
            nodes: this.nodes.map((node) => node.serialize()),
            inputs: this.inputs
        };
    }

    public serializeForFile(): object {
        return {
            nodes: this.nodes.map((node) => node.serializeForFile()),
            inputs: Array.from(this.inputs.entries()).reduce((obj, [key, value]) => {
                // @ts-ignore
                obj[key] = value.map((edge) => edge.serialize());
                return obj;
            }, {})
        };
    }

    public static deserialize(data: any): TDState {
        const state = new TDState();

        state.nodes = data.nodes.map((nodeData: any) => TDNode.deserialize(nodeData));
        state.inputs = data.inputs;

        return state;
    }

    public static deserializeFromFile(data: any): TDState {
        const state = new TDState();

        state.nodes = data.nodes.map((nodeData: any) => TDNode.deserializeFromFile(nodeData));

        const inputs = new Map<string, TDEdge[]>();
        for (const [key, value] of Object.entries(data.inputs)) {
            inputs.set(
                key,
                // @ts-ignore
                value.map((edgeData: any) => TDEdge.deserialize(edgeData))
            );
        }
        state.inputs = inputs;

        return state;
    }

    public toString(): string {
        const nodesString = this.nodes.map((node) => node.toString()).join(', ');

        const inputsString = Array.from(this.inputs.keys())
            .map(
                (element) =>
                    `${element}: [${this.inputs
                        .get(element)
                        ?.map((e) => `${e.destination} (${e.parm})`)
                        ?.join(', ')}]`
            )
            .join('; ');

        return `TDState { nodes: [${nodesString}], inputs: {${inputsString}} }`;
    }

    public static async loadFromFile(content: string): Promise<TDState> {
        const parsedData = JSON.parse(content);
        return TDState.deserializeFromFile(parsedData);
    }

    public isNodeInState(node: TDNode): boolean {
        const stateNode = this.nodes.find(
            (stateNode) =>
                stateNode.name === node.name && stateNode.propertiesEqual(node.properties)
        );

        if (!stateNode) return false;

        const stateEdges = this.inputs.get(stateNode.name) || [];
        const nodeEdges = this.inputs.get(node.name) || [];

        return TDState.areEdgesEqual(stateEdges, nodeEdges);
    }

    public static areEdgesEqual(edgesA: TDEdge[], edgesB: TDEdge[]): boolean {
        if (edgesA.length !== edgesB.length) return false;

        for (let i = 0; i < edgesA.length; i++) {
            if (edgesA[i].destination !== edgesB[i].destination) return false;
        }
        return true;
    }
}
