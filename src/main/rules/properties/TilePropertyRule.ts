import { PropertyRule } from '../../models/Rule';

export class TilePropertyRule implements PropertyRule {
    name: string;
    description: string;
    match: (line: string) => boolean;
    extract: (line: string, nodeProperties: Map<string, string>) => void;

    constructor() {
        this.name = 'tile';
        this.description = 'tile property (.n file), format: tile <tileX> <tileY> <sizeX> <sizeY>';
        this.match = (line: string) => line.startsWith('tile');
        this.extract = (line: string, nodeProperties: Map<string, string>) => {
            const parts = line.split(' ').slice(1);
            if (parts.length === 4) {
                nodeProperties.set('tileX', parts[0].trim());
                nodeProperties.set('tileY', parts[1].trim());
                nodeProperties.set('sizeX', parts[2].trim());
                nodeProperties.set('sizeY', parts[3].trim());
            }
        };
    }
}
