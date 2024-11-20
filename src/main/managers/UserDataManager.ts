import Store from 'electron-store';
import Project from '../models/Project';
import log from 'electron-log/main.js';
import { User } from '../models/api/User';
import { AuthToken } from '../models/api/AuthToken';

class UserDataManager {
    private store: Store;

    constructor() {
        this.store = new Store();
        log.info('UserDataManager initialized.');
    }

    addRecentProject(project: Project): void {
        log.info(`Attempting to add project: ${project.name} with path: ${project.path}`);
        // @ts-ignore
        const recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        const projectExists = recentProjects.some((proj) => proj.path === project.path);

        if (!projectExists) {
            recentProjects.push(project);
            // @ts-ignore
            this.store.set('recentProjects', recentProjects);
            log.info(`Project ${project.name} added to recent projects.`);
        } else {
            log.info(`Project ${project.name} already exists in recent projects.`);
        }
    }

    removeRecentProject(projectPath: string): void {
        log.info(`Attempting to remove project with path: ${projectPath}`);
        // @ts-ignore
        let recentProjects: Project[] = this.store.get('recentProjects', []) as Project[];
        const initialLength = recentProjects.length;

        recentProjects = recentProjects.filter((proj) => proj.path !== projectPath);
        // @ts-ignore
        this.store.set('recentProjects', recentProjects);

        if (recentProjects.length < initialLength) {
            log.info(`Project with path ${projectPath} removed from recent projects.`);
        } else {
            log.warn(`Project with path ${projectPath} was not found in recent projects.`);
        }
    }

    getRecentProjects(): Project[] {
        log.info('Retrieving recent projects.');
        // @ts-ignore
        const recentProjects = this.store.get('recentProjects', []) as Project[];
        log.info(`Found ${recentProjects.length} recent project(s).`);
        return recentProjects;
    }

    setTouchDesignerBinPath(path: string): void {
        log.info(`Setting TouchDesigner binary path to: ${path}`);
        // @ts-ignore
        this.store.set('touchDesignerBinPath', path);
    }

    getTouchDesignerBinPath(): string | undefined {
        log.info('Retrieving TouchDesigner binary path.');
        // @ts-ignore
        const path = this.store.get('touchDesignerBinPath') as string;
        if (path) {
            log.info(`TouchDesigner binary path is: ${path}`);
        } else {
            log.warn('TouchDesigner binary path is not set.');
        }
        return path;
    }

    saveAuthToken(token: AuthToken): void {
        log.info('Saving authentication token.');
        // @ts-ignore
        this.store.set('authToken', token);
        log.info(`Authentication token for ${token.name} saved.`);
    }

    getAuthToken(): AuthToken | null {
        log.info('Retrieving authentication token.');
        // @ts-ignore
        const token = this.store.get('authToken', null) as AuthToken | null;
        if (token) {
            log.info(`Authentication token retrieved: ${token.name}`);
        } else {
            log.warn('No authentication token found.');
        }
        return token;
    }

    clearAuthToken(): void {
        log.info('Clearing authentication token.');
        // @ts-ignore
        this.store.delete('authToken');
        log.info('Authentication token cleared.');
    }

    saveUserCredentials(username: string, password: string): void {
        log.info('Saving user credentials in Base64.');
        const encodedCredentials = btoa(`${username}:${password}`);
        // @ts-ignore
        this.store.set('userCredentials', encodedCredentials);
        log.info('User credentials saved.');
    }

    getUserCredentials(): { username: string; password: string } | null {
        log.info('Retrieving user credentials from store.');
        // @ts-ignore
        const encodedCredentials = this.store.get('userCredentials', null) as string | null;

        if (encodedCredentials) {
            const decodedCredentials = atob(encodedCredentials);
            const [username, password] = decodedCredentials.split(':');
            if (username && password) {
                log.info('User credentials successfully retrieved.');
                return { username, password };
            } else {
                log.warn('Stored user credentials are malformed.');
            }
        } else {
            log.warn('No user credentials found.');
        }

        return null;
    }

    clearUserCredentials(): void {
        log.info('Clearing user credentials.');
        // @ts-ignore
        this.store.delete('userCredentials');
        log.info('User credentials cleared.');
    }

    saveUser(user: User): void {
        log.info(`Saving user with ID: ${user.id} and username: ${user.username}`);
        // @ts-ignore
        this.store.set('user', user);
        log.info('User saved successfully.');
    }

    getUser(): User | null {
        log.info('Retrieving user from store.');
        // @ts-ignore
        const user = this.store.get('user', null) as User | null;

        if (user) {
            log.info(`User retrieved: ${user.username}`);
            return user;
        } else {
            log.warn('No user found in store.');
            return null;
        }
    }

    clearUser(): void {
        log.info('Clearing user from store.');
        // @ts-ignore
        this.store.delete('user');
        log.info('User cleared successfully.');
    }
}

export default new UserDataManager();
