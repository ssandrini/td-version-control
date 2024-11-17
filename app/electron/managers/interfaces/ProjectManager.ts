import { Version } from '../../models/Version';

// TODO: S type musy be serializable
// S: state
// R: mergeResult
export interface ProjectManager<S, R> {
    init(dir: string, src?: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    getVersionState(dir: string, versionId?: string): Promise<S>;

    // Remote handling
    pull(dir: string): Promise<R>;
    push(dir: string): Promise<void>;
    finishMerge(dir: string, userInput: S): Promise<void>;
}
