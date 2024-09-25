import { HasKey } from "../utils/Set";

export class TDNode implements HasKey {
    readonly name: string;
    readonly type?: string;

    constructor(name: string, type?: string) {
        this.name = name;
        this.type = type;
    }

    getKey(): string {
        return this.name
    }
}
