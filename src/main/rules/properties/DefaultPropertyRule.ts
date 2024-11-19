import { PropertyRule } from '../../models/Rule';

export class DefaultPropertyRule implements PropertyRule {
    name: string;
    description: string;
    match: (line: string) => boolean;
    extract: (line: string, nodeProperties: Map<string, string>) => void;

    constructor() {
        this.name = 'default';
        this.description = 'default property, format: <propertyName> <???> <value>';

        this.match = (line: string) => {
            const parts = line.split(' ');
            if (parts.length !== 3) return false;
            const value = parts[2].trim();
            return !isNaN(Number(value)) || /^[a-zA-Z0-9_.]+$/.test(value);
        };

        this.extract = (line: string, nodeProperties: Map<string, string>) => {
            const parts = line.split(' ');
            const propertyName = parts[0].trim();
            const value = parts[2].trim();

            if (this.match(line)) {
                nodeProperties.set(propertyName, value);
            }
        };
    }
}
