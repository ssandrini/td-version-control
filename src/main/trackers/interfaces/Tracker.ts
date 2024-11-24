import { Version } from '../../models/Version';
import { Content, Filename, TrackerMergeResult } from '../../merge/TrackerMergeResult';

export interface Tracker {
    init(dir: string, dst?: string): Promise<void>;
    currentVersion(dir: string): Promise<Version>;
    initialVersion(dir: string): Promise<Version>;
    listVersions(dir: string): Promise<Version[]>;
    createVersion(dir: string, versionName: string, description?: string): Promise<Version>;
    addTag(dir: string, versionId: string, tag: string): Promise<void>;
    removeTag(dir: string, tag: string): Promise<void>;
    goToVersion(dir: string, versionId: string): Promise<Version>;
    discardChanges(dir: string): Promise<void>;
    compare(dir: string, versionId?: string, file?: string, modified?: boolean): Promise<string>;
    readFile(dir: string, filePath: string, versionId?: string): Promise<string>;

    // Remote handling
    clone(dir: string, url: string): Promise<void>;
    pull(dir: string, excludedFiles: RegExp[]): Promise<TrackerMergeResult>;
    push(dir: string): Promise<void>;
    settleConflicts(dir: string, userInput: Map<Filename, Content[]>): Promise<void>;
    abortMerge(dir: string): Promise<void>;
    getMergeResult(dir: string): Promise<TrackerMergeResult>;
}
