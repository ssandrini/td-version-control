/**
 * Represents a rule for extracting a property from a TouchDesigner file. (.n, .parm, .network, etc)
 */
export interface PropertyRule {
    name: string;
    description: string;
    /**
     * Function that checks if a given line matches the rule.
     * @param line - The line from the file to be checked against the rule.
     * @returns A boolean value indicating whether the line matches the rule.
     */
    match: (line: string) => boolean;

    /**
     * Function that extracts the property from the line and stores it in the node's properties map.
     * @param line - The line from the file containing the property to extract.
     * @param nodeProperties - The map where extracted properties will be stored, with the key as the property name and the value as the property value.
     */
    extract: (line: string, nodeProperties: Map<string, string>) => void;
}
