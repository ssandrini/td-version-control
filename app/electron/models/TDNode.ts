import { HasKey } from "../utils/Set";

export class TDNode implements HasKey {
    readonly name: string;
    readonly type?: string;
    readonly subtype?: string;
    
    constructor(name: string, type?: string, subtype?: string) {
        this.name = name;
        this.type = type;
        this.subtype = subtype;
    }

    getKey(): string {
        return this.name
    }
}
