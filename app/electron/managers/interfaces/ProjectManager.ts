import { ChangeSet } from '../../models/ChangeSet';
import { Version } from '../../models/Version';

export interface ProjectManager<T> {
    init(dir: string, src?: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    compare(dir: string, versionId?: string): Promise<ChangeSet<T>>;
    getVersionStructure(dir: string, versionId?: string): Promise<T[]>; 
}
