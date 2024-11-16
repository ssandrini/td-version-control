import Store from "electron-store";
import Project from "../models/Project";
import log from "electron-log/main";

export class UserDataManager {
    private store: Store;

    constructor() {
        this.store = new Store();
        log.info("UserDataManager initialized.");
    }

    addRecentProject(project: Project): void {
        log.info(`Attempting to add project: ${project.name} with path: ${project.path}`);
        const recentProjects: Project[] = this.store.get("recentProjects", []) as Project[];
        const projectExists = recentProjects.some(proj => proj.path === project.path);

        if (!projectExists) {
            recentProjects.push(project);
            this.store.set("recentProjects", recentProjects);
            log.info(`Project ${project.name} added to recent projects.`);
        } else {
            log.info(`Project ${project.name} already exists in recent projects.`);
        }
    }

    removeRecentProject(projectPath: string): void {
        log.info(`Attempting to remove project with path: ${projectPath}`);
        let recentProjects: Project[] = this.store.get("recentProjects", []) as Project[];
        const initialLength = recentProjects.length;

        recentProjects = recentProjects.filter(proj => proj.path !== projectPath);
        this.store.set("recentProjects", recentProjects);

        if (recentProjects.length < initialLength) {
            log.info(`Project with path ${projectPath} removed from recent projects.`);
        } else {
            log.warn(`Project with path ${projectPath} was not found in recent projects.`);
        }
    }

    getRecentProjects(): Project[] {
        log.info("Retrieving recent projects.");
        const recentProjects = this.store.get("recentProjects", []) as Project[];
        log.info(`Found ${recentProjects.length} recent project(s).`);
        return recentProjects;
    }

    setTouchDesignerBinPath(path: string): void {
        log.info(`Setting TouchDesigner binary path to: ${path}`);
        this.store.set("touchDesignerBinPath", path);
    }

    getTouchDesignerBinPath(): string | undefined {
        log.info("Retrieving TouchDesigner binary path.");
        const path = this.store.get("touchDesignerBinPath") as string;
        if (path) {
            log.info(`TouchDesigner binary path is: ${path}`);
        } else {
            log.warn("TouchDesigner binary path is not set.");
        }
        return path;
    }

    /**
     * Saves the authentication token to the store.
     * @param {string} token - The authentication token to save.
     */
    saveAuthToken(token: string): void {
        log.info("Saving authentication token.");
        this.store.set("authToken", token);
        log.info("Authentication token saved.");
    }

    /**
     * Retrieves the stored authentication token.
     * @returns {string | null} - The authentication token, or null if not set.
     */
    getAuthToken(): string | null {
        log.info("Retrieving authentication token.");
        const token = this.store.get("authToken", null) as string | null;
        if (token) {
            log.info("Authentication token retrieved.");
        } else {
            log.warn("No authentication token found.");
        }
        return token;
    }

    /**
     * Removes the authentication token from the store.
     */
    clearAuthToken(): void {
        log.info("Clearing authentication token.");
        this.store.delete("authToken");
        log.info("Authentication token cleared.");
    }
}