export interface Processor {
    preprocess(dir: string, outDir?: string): Promise<string[]>; // expand
    postprocess(dir: string, outDir?: string): Promise<string[]>; // collapse
}
