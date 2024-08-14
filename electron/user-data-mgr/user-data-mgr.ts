import Store from 'electron-store';

class UserDataManager {
    private store: Store;

    constructor() {
        this.store = new Store();
    }

    addRecentProject(projectPath: string): void {
        const recentProjects: string[] = this.store.get('recentProjects', []) as string[];
        if (!recentProjects.includes(projectPath)) {
            recentProjects.push(projectPath);
            this.store.set('recentProjects', recentProjects);
        }
    }

    removeRecentProject(projectPath: string): void {
        let recentProjects: string[] = this.store.get('recentProjects', []) as string[];
        recentProjects = recentProjects.filter(path => path !== projectPath);
        this.store.set('recentProjects', recentProjects);
    }

    getRecentProjects(): string[] {
        return this.store.get('recentProjects', []) as string[];
    }

    setTouchDesignerBinPath(path: string): void {
        this.store.set('touchDesignerBinPath', path);
    }

    getTouchDesignerBinPath(): string | undefined {
        return this.store.get('touchDesignerBinPath') as string;
    }
}

export default new UserDataManager();