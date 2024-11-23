import { Version } from '../../models/Version';

// TODO: S type musy be serializable
// S: state
// R: mergeResult
export interface ProjectManager<S, R> {
    init(dir: string, dst?: string, src?: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    hasChanges(dir: string): Promise<boolean>;
    addTag(dir: string, versionId: string, tag: string): Promise<void>;
    removeTag(dir: string, tag: string): Promise<void>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    getVersionState(dir: string, versionId?: string): Promise<S>;
    lastVersion(dir: string): Promise<Version>;

    // Remote handling
    pull(dir: string): Promise<R>;
    push(dir: string): Promise<void>;
    finishMerge(dir: string, userInput: S, versionName: string, description: string): Promise<void>;
    getMergeStatus(dir: string): Promise<R>;
}
