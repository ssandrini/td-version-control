import { ParmFileApplyOperatorRule } from "../inputs/ParmFileApplyOperatorRule";

describe('ParmFileApplyOperatorRule', () => {
    const rule = new ParmFileApplyOperatorRule();

    // Helper function to avoid repetition
    const runExtractTest = (content: string, expected: string[]) => {
        const result = rule.extract(content.trim());
        expect(result).toEqual(expected);
    };

    it('should extract input nodes from valid .parm content', () => {
        const content1 = `?\ntop 0 comp1\nresetpulse 17 0 op('keyboardin1')['k1']\n?`;
        const content2 = `?\nchop 67108864 noise1\ndataformat 67108864 legacy\n?`;
        const content3 = `?\npageindex 67108864 2\nradiusx 67108864 0.08\nradiusy 67108864 0.08\ncenterx 67108881 0 op('null3')['tx']\ncentery 67108881 0 op('null3')['ty']\nfillalpha 67108880 0.503 op('null4')['tx']\nsoftness 67108864 0.088\ncombineinput 67108864 res\nresolutionw 67108881 1000 op('constant2')['X']\nresolutionh 67108881 1000 op('constant2')['Y']\nformat 67108864 rgba32float\n?`;
        const content4 = `?\ndisplaceweightx 67108896 0.01\ndisplaceweighty 67108896 0.01\noffsetweight 201326609 0 "1 - me.par.uvweight.eval()"\n?`;

        const expectedInputs = [
            ['keyboardin1'],
            [],
            ['null3', 'null4', 'constant2'],
            []
        ];

        runExtractTest(content1, expectedInputs[0]);
        runExtractTest(content2, expectedInputs[1]);
        runExtractTest(content3, expectedInputs[2]);
        runExtractTest(content4, expectedInputs[3]);
    });

    it('should return an empty array when no matching lines are found', () => {
        const content = `?\nradius 67108864 0.1\nalpha 67108864 0.5\n?`;
        runExtractTest(content, []);
    });

    // Helper function for matching tests
    const runMatchTest = (content: string, shouldMatch: boolean) => {
        const result = rule.match(content.trim());
        expect(result).toBe(shouldMatch);
    };

    it('should match valid content', () => {
        const validContent = `?\nresetpulse 17 0 op('keyboardin1')['k1']\n?`;
        runMatchTest(validContent, true);
    });

    it('should not match invalid content', () => {
        const invalidContent = `?\nchop 67108864 noise1\ndataformat 67108864 legacy\n?`;
        runMatchTest(invalidContent, false);
    });
});
