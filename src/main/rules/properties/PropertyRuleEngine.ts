import * as RuleNames from '../Constants';
import { IgnorePropertyRule } from './IgnorePropertyRule';
import { TilePropertyRule } from './TilePropertyRule';
import { DefaultPropertyRule } from './DefaultPropertyRule';
import { PropertyRule } from './interfaces/PropertyRule';
import { QuotedPropertyRule } from './QuotedPropertyRule';

export class PropertyRuleEngine {
    private readonly rules: PropertyRule[];

    public constructor() {
        this.rules = this.initializeRules();
    }

    private initializeRules(): PropertyRule[] {
        return [
            new IgnorePropertyRule(RuleNames.RULE_FLAGS, 'ignore flags property', (line: string) =>
                line.startsWith('flags')
            ),
            new IgnorePropertyRule(RuleNames.RULE_VIEW, 'ignore view property', (line: string) =>
                line.startsWith('view')
            ),
            new IgnorePropertyRule(
                RuleNames.RULE_PAGE_INDEX,
                'ignore page index property',
                (line: string) => line.startsWith('pageindex')
            ),
            new TilePropertyRule(),
            new DefaultPropertyRule(),
            new QuotedPropertyRule()
        ];
    }

    /**
     * Applies the rules to a given line and updates the provided map with extracted properties.
     * @param line - The line to be processed.
     * @param nodeProperties - The map to which extracted properties will be added.
     * @param ruleNames - Optional array of rule names to filter the applied rules.
     */
    public applyRules(
        line: string,
        nodeProperties: Map<string, string>,
        ruleNames?: string[]
    ): void {
        const applicableRules = ruleNames
            ? this.rules.filter((rule) => ruleNames.includes(rule.name))
            : this.rules;

        for (const rule of applicableRules) {
            if (rule.match(line)) {
                rule.extract(line, nodeProperties);
            }
        }
    }
}
