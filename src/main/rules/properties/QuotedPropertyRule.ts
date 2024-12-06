import { PropertyRule } from './interfaces/PropertyRule';

export class QuotedPropertyRule implements PropertyRule {
    name: string;
    description: string;
    match: (line: string) => boolean;
    extract: (line: string, nodeProperties: Map<string, string>) => void;

    constructor() {
        this.name = 'quoted';
        this.description =
            'property with quoted string, format: <propertyName> <???> <value> "something"';

        this.match = (line: string) => {
            const parts = line.split(' ');
            if (parts.length < 4) return false;

            const value = parts[2].trim();
            const quotedPart = line.substring(line.indexOf('"'));
            return (
                (!isNaN(Number(value)) || /^[a-zA-Z0-9_.]+$/.test(value)) &&
                quotedPart.startsWith('"') &&
                quotedPart.endsWith('"')
            );
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
