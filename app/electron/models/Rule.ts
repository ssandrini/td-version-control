export class PropertyRule {
    name: string;
    description: string;
    match: (line: string) => boolean;
    extract: (line: string, nodeProperties: Map<string, string>) => void;

    constructor(name: string, description: string, match: (line: string) => boolean, extract: (line: string, nodeProperties: Map<string, string>) => void) {
        this.name = name;
        this.description = description;
        this.match = match;
        this.extract = extract;
    }
};