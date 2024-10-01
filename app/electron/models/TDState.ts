import { TDNode } from "./TDNode";

export class TDState {
    public nodes: TDNode[] = [];
    public inputs: Map<TDNode, string[]> = new Map();

    constructor() {}
}