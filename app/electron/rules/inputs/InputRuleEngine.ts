import { TDEdge } from "../../models/TDEdge";
import { InputRule } from "./interfaces/InputRule";
import { NetworkFileRule } from "./NetworkFileRule";
import { NFileRule } from "./NFileRule";
import { ParmFileApplyOperatorRule } from "./ParmFileApplyOperatorRule";
import { ParmFileChangeOperatorRule } from "./ParmFileChangeOperatorRule";

export class InputRuleEngine {
    private readonly rules: InputRule[];

    constructor() {
        this.rules = [
            new NetworkFileRule(),
            new NFileRule(),
            new ParmFileApplyOperatorRule(),
            new ParmFileChangeOperatorRule(),
        ];
    }

    /**
     * Executes the matching and extraction process over the given content using the provided rules.
     * @param content The file content to process.
     * @returns An array of inputs extracted from the content.
     */
    public process(content: string): TDEdge[] {
        const extractedInputs: TDEdge[] = [];

        for (const rule of this.rules) {
            const inputs = rule.extract(content);
            extractedInputs.push(...inputs);
        }

        return extractedInputs.filter((edge, index, self) =>
            index === self.findIndex(e => e.destination === edge.destination)
        );
    }
}
