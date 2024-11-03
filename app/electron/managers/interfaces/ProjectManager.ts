import { Version } from '../../models/Version';

// TODO: S type musy be serializable
export interface ProjectManager<S> {
    init(dir: string, src?: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    getVersionState(dir: string, versionId?: string): Promise<S>;

    // Remote handling
    pull(dir: string): Promise<void>;
    push(dir: string): Promise<void>;
}
