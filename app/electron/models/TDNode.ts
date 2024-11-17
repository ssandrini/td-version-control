import { HasKey } from "../utils/Set";

export class TDNode implements HasKey {
    readonly name: string;
    readonly type?: string;
    readonly subtype?: string;
    readonly properties?: Map<string, string>;

    constructor(name: string, type?: string, subtype?: string, properties?: Map<string, string>) {
        this.name = name;
        this.type = type;
        this.subtype = subtype;
        this.properties = properties;
    }

    getKey(): string {
        return this.name; // TO DO: container?
    }

    toString(): string {
        let result = `Node: ${this.name}\nType: ${this.type || 'N/A'}\nSubtype: ${this.subtype || 'N/A'}`;
        if (this.properties && this.properties.size > 0) {
            result += `\nProperties:\n`;
            this.properties.forEach((value, key) => {
                result += `  ${key}: ${value}\n`;
            });
        } else {
            result += '\nNo properties available';
        }

        return result;
    }

    serialize(): object {
        return {
            name: this.name,
            type: this.type,
            subtype: this.subtype,
            properties: this.properties
        };
    }

    static deserialize(data: any): TDNode {
        const properties = new Map(data.properties);
        return new TDNode(data.name, data.type, data.subtype, properties as Map<string, string>);
    }

    serializeForFile(): object {
        return {
            name: this.name,
            type: this.type,
            subtype: this.subtype,
            properties: Object.fromEntries(this.properties || new Map())
        };
    }

    static deserializeFromFile(data: any): TDNode {
        const properties = new Map(Object.entries(data.properties));
        return new TDNode(data.name, data.type, data.subtype, properties as Map<string, string>);
    }

    public propertiesEqual(otherProperties?: Map<string, string>): boolean {
        if (!otherProperties || this.properties?.size !== otherProperties.size) {
            return false;
        }

        for (const [key, value] of this.properties) {
            if (otherProperties.get(key) !== value) {
                return false;
            }
        }

        return true;
    }
}
