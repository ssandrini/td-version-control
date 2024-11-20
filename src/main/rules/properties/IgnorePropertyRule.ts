import { PropertyRule } from './interfaces/PropertyRule';

export class IgnorePropertyRule implements PropertyRule {
    name: string;
    description: string;
    match: (line: string) => boolean;
    extract: (line: string, nodeProperties: Map<string, string>) => void;

    constructor(name: string, description: string, match: (line: string) => boolean) {
        this.name = name;
        this.description = description;
        this.match = match;
        this.extract = () => {
            /* No action for ignored properties */
        };
    }
}
