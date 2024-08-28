import { Tracker } from "../interfaces/Tracker";
import { Version } from "../models/Version";

export class SimpleGitTracker implements Tracker {
    init(dir: string): Promise<Version> {
        throw new Error("Method not implemented.");
    }
    currentVersion(dir: string): Promise<Version> {
        throw new Error("Method not implemented.");
    }
    listVersions(dir: string): Promise<Version[]> {
        throw new Error("Method not implemented.");
    }
    createVersion(dir: string, versionName: string, description?: string): Promise<Version> {
        throw new Error("Method not implemented.");
    }
    goToVersion(dir: string, versionName: string): Promise<Version> {
        throw new Error("Method not implemented.");
    }
    compare(dir: string, to?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    
}