import { Version } from '../../models/Version';

export interface Tracker {
    init(dir: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    compare(dir: string, to?: string, file?: string): Promise<string>; 
}