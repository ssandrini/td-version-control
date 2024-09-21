import Store from 'electron-store';
import Project from '../models/Project';
import log from 'electron-log/main';

class UserDataManager {
    private store: Store;

    constructor() {
        this.store = new Store();
        log.info('UserDataManager initialized.');
    }

    /**
     * Adds a project to the list of recent projects if it doesn't already exist.
     * @param {Project} project - The project to add to the recent projects list.
     */
    addRecentProject(project: Project): void {
        log.info(`Attempting to add project: ${project.name} with path: ${project.path}`);
        const recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        const projectExists = recentProjects.some(proj => proj.path === project.path);

        if (!projectExists) {
            recentProjects.push(project);
            this.store.set('recentProjects', recentProjects);
            log.info(`Project ${project.name} added to recent projects.`);
        } else {
            log.info(`Project ${project.name} already exists in recent projects.`);
        }
    }

    /**
     * Removes a project from the list of recent projects based on its path.
     * @param {string} projectPath - The file path of the project to remove.
     */
    removeRecentProject(projectPath: string): void {
        log.info(`Attempting to remove project with path: ${projectPath}`);
        let recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        const initialLength = recentProjects.length;

        recentProjects = recentProjects.filter(proj => proj.path !== projectPath);
        this.store.set('recentProjects', recentProjects);

        if (recentProjects.length < initialLength) {
            log.info(`Project with path ${projectPath} removed from recent projects.`);
        } else {
            log.warn(`Project with path ${projectPath} was not found in recent projects.`);
        }
    }

    /**
     * Retrieves the list of recent projects.
     * @returns {Project[]} - An array of recent Project objects.
     */
    getRecentProjects(): Project[] {
        log.info('Retrieving recent projects.');
        const recentProjects = this.store.get('recentProjects', []) as Project[];
        log.info(`Found ${recentProjects.length} recent project(s).`);
        return recentProjects;
    }

    /**
     * Sets the path to the TouchDesigner binary.
     * @param {string} path - The path to the TouchDesigner binary executable.
     */
    setTouchDesignerBinPath(path: string): void {
        log.info(`Setting TouchDesigner binary path to: ${path}`);
        this.store.set('touchDesignerBinPath', path);
    }

    /**
     * Retrieves the stored path of the TouchDesigner binary.
     * @returns {string | undefined} - The stored path to the TouchDesigner binary, or undefined if not set.
     */
    getTouchDesignerBinPath(): string | undefined {
        log.info('Retrieving TouchDesigner binary path.');
        const path = this.store.get('touchDesignerBinPath') as string;
        if (path) {
            log.info(`TouchDesigner binary path is: ${path}`);
        } else {
            log.warn('TouchDesigner binary path is not set.');
        }
        return path;
    }
}

export default new UserDataManager();
