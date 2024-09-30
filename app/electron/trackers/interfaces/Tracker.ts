import { Version } from '../../models/Version';

export interface Tracker {
    init(dir: string): Promise<Version>;
    currentVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    compare(dir: string, versionId?: string, file?: string, modified? : boolean): Promise<string>;
    readFile(dir: string, versionId?: string, filePath: string): Promise<string>;
}