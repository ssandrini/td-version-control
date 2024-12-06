import { ParmFileChangeOperatorRule } from '../inputs/ParmFileChangeOperatorRule';
import { TDEdge } from '../../models/TDEdge';

describe('ParmFileChangeOperatorRule', () => {
    const rule = new ParmFileChangeOperatorRule();

    it('should extract input nodes from valid .parm content', () => {
        const content1 = `?\ntop 0 comp1\nresetpulse 17 0 op('keyboardin1')['k1']\n?`.trim();
        const content2 = `?\nchop 67108864 noise1\ndataformat 67108864 legacy\n?`.trim();
        const content3 =
            `?\npageindex 67108864 2\nradiusx 67108864 0.08\nradiusy 67108864 0.08\ncenterx 67108881 0 op('null3')['tx']\ncentery 67108881 0 op('null3')['ty']\nfillalpha 67108880 0.503 op('null4')['tx']\nsoftness 67108864 0.088\ncombineinput 67108864 res\nresolutionw 67108881 1000 op('constant2')['X']\nresolutionh 67108881 1000 op('constant2')['Y']\nformat 67108864 rgba32float\n?`.trim();
        const content4 =
            `?\ndisplaceweightx 67108896 0.01\ndisplaceweighty 67108896 0.01\noffsetweight 201326609 0 "1 - me.par.uvweight.eval()"\n?`.trim();

        const expectedInputs = [[new TDEdge('comp1', true)], [new TDEdge('noise1', true)], [], []];

        const actualInputs1 = rule.extract(content1);
        const actualInputs2 = rule.extract(content2);
        const actualInputs3 = rule.extract(content3);
        const actualInputs4 = rule.extract(content4);

        expect(actualInputs1).toEqual(expectedInputs[0]);
        expect(actualInputs2).toEqual(expectedInputs[1]);
        expect(actualInputs3).toEqual(expectedInputs[2]);
        expect(actualInputs4).toEqual(expectedInputs[3]);
    });

    it('should return an empty array when no matching lines are found', () => {
        const content = `?\nradius 67108864 0.1\nalpha 67108864 0.5\n?`;
        const result = rule.extract(content);
        expect(result).toEqual([]);
    });

    it('should not match invalid content', () => {
        const invalidContent = `?\ninvalidcommand 0 input\n?`.trim();
        expect(rule.match(invalidContent)).toBe(false);
    });

    it('should not add duplicate inputs', () => {
        const content = `?\ntop 0 comp1\nchop 0 comp1\nsop 1 comp2\nchop 0 comp1\n?`.trim();
        const expectedInputs = [new TDEdge('comp1', true), new TDEdge('comp2', true)];

        const actualInputs = rule.extract(content);
        expect(actualInputs).toEqual(expectedInputs);
    });
});
