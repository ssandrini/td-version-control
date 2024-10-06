/**
 * Represents a rule for extracting input nodes from a TouchDesigner file.
 */
export interface InputRule {
    name: string;
    description: string;

    /**
     * Function that checks if a given content matches the rule.
     * @param content - The content of the .n file to be checked against the rule.
     * @returns A boolean value indicating whether the content matches the rule.
     */
    match: (content: string) => boolean;

    /**
     * Function that extracts input node names from the content.
     * @param content - The content of the .n file containing the inputs section.
     * @returns An array of strings representing the names of the input nodes.
     */
    extract: (content: string) => string[];
}