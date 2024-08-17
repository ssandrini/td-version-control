import Store from 'electron-store';
import Project from '../../src/models/Project';

class UserDataManager {
    private store: Store;

    constructor() {
        this.store = new Store();
    }

    addRecentProject(project: Project): void {
        const recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        const projectExists = recentProjects.some(proj => proj.path === project.path);

        if (!projectExists) {
            recentProjects.push(project);
            this.store.set('recentProjects', recentProjects);
        }
    }

    removeRecentProject(projectPath: string): void {
        console.log("Voy a borrar el proyecto con path: " + projectPath);
        let recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        recentProjects = recentProjects.filter(proj => proj.path !== projectPath);
        this.store.set('recentProjects', recentProjects);
    }

    getRecentProjects(): Project[] {
        return this.store.get('recentProjects', []) as Project[];
    }

    setTouchDesignerBinPath(path: string): void {
        this.store.set('touchDesignerBinPath', path);
    }

    getTouchDesignerBinPath(): string | undefined {
        return this.store.get('touchDesignerBinPath') as string;
    }
}

export default new UserDataManager();
