import electron, { contextBridge, ipcRenderer } from 'electron';
import Project from '../main/models/Project';
import { API_METHODS } from '../main/apiMethods';
import { TDState } from '../main/models/TDState';
import { electronAPI } from '@electron-toolkit/preload';
import { RegisterUserRequest } from '../main/services/UserService';
const api = {
    listVersions: async (dir: string) => ipcRenderer.invoke(API_METHODS.LIST_VERSIONS, dir),
    filePicker: async () => ipcRenderer.invoke(API_METHODS.FILE_PICKER),
    getRecentProjects: async () => ipcRenderer.invoke(API_METHODS.RECENT_PROJECTS),
    saveProject: async (project: Project) => ipcRenderer.invoke(API_METHODS.SAVE_PROJECT, project),
    deleteProject: async (path: string) => ipcRenderer.invoke(API_METHODS.DELETE_PROJECT, path),
    checkDependencies: async () => ipcRenderer.invoke(API_METHODS.CHECK_DEPENDENCIES),
    openToe: async (path: string) => ipcRenderer.invoke(API_METHODS.OPEN_TD, path),
    createProject: async (
        dir: string,
        name: string,
        description: string,
        remote: boolean,
        src?: string
    ) => ipcRenderer.invoke(API_METHODS.CREATE_PROJECT, dir, name, description, remote, src),
    createNewVersion: async (dir: string, name: string, description: string) =>
        ipcRenderer.invoke(API_METHODS.CREATE_VERSION, dir, name, description),
    hasChanges: async (dir: string) => ipcRenderer.invoke(API_METHODS.HAS_CHANGES, dir),
    addTag: async (dir: string, versionId: string, tag: string) =>
        electron.ipcRenderer.invoke(API_METHODS.ADD_TAG, dir, versionId, tag),
    removeTag: async (dir: string, tag: string) =>
        electron.ipcRenderer.invoke(API_METHODS.REMOVE_TAG, dir, tag),
    getCurrentVersion: async (path: string) =>
        ipcRenderer.invoke(API_METHODS.CURRENT_VERSION, path),
    goToVersion: async (dir: string, versionId: string) =>
        ipcRenderer.invoke(API_METHODS.GO_TO_VERSION, dir, versionId),
    discardChanges: async (dir: string) => ipcRenderer.invoke(API_METHODS.DISCARD_CHANGES, dir),
    getTemplates: async () => ipcRenderer.invoke(API_METHODS.GET_TEMPLATES),
    getState: async (path: string, versionId?: string) => {
        if (versionId === '[wip]') {
            versionId = undefined;
        }
        return await ipcRenderer.invoke(API_METHODS.GET_STATE, path, versionId);
    },
    publish: async (dir: string, name: string, description: string) =>
        ipcRenderer.invoke(API_METHODS.PUBLISH, dir, name, description),
    isPublished: async (dir: string) => ipcRenderer.invoke(API_METHODS.IS_PUBLISHED, dir),
    pull: async (dir: string) => ipcRenderer.invoke(API_METHODS.PULL, dir),
    push: async (dir: string) => ipcRenderer.invoke(API_METHODS.PUSH, dir),
    finishMerge: async (dir: string, state: TDState, versionName: string, description: string) =>
        ipcRenderer.invoke(API_METHODS.FINISH_MERGE, dir, state, versionName, description),
    authenticate: async (username: string, password: string) =>
        ipcRenderer.invoke(API_METHODS.AUTHENTICATE_USER, username, password),
    getUser: async () => ipcRenderer.invoke(API_METHODS.GET_USER),
    getRemoteProjects: async () => ipcRenderer.invoke(API_METHODS.GET_REMOTE_PROJECTS),
    logout: async () => ipcRenderer.invoke(API_METHODS.LOGOUT),
    getCollaborators: async (owner: string, projectName: string) =>
        ipcRenderer.invoke(API_METHODS.GET_COLLABORATORS, owner, projectName),
    addCollaborator: async (
        owner: string,
        projectName: string,
        collaborator: string,
        permissions: 'read' | 'write' | 'admin'
    ) =>
        ipcRenderer.invoke(
            API_METHODS.ADD_COLLABORATOR,
            owner,
            projectName,
            collaborator,
            permissions
        ),
    removeCollaborator: async (owner: string, projectName: string, collaborator: string) =>
        ipcRenderer.invoke(API_METHODS.REMOVE_COLLABORATOR, owner, projectName, collaborator),
    searchUser: async (username: string) => ipcRenderer.invoke(API_METHODS.SEARCH_USER, username),
    openDirectory: async (dir: string) => ipcRenderer.invoke(API_METHODS.OPEN_DIRECTORY, dir),
    register: async (request: RegisterUserRequest) =>
        ipcRenderer.invoke(API_METHODS.REGISTER, request),
    getMergeStatus: async (dir: string) => ipcRenderer.invoke(API_METHODS.GET_MERGE_STATUS, dir),
    minimizeApp: async () => ipcRenderer.send('minimizeApp'),
    maximizeRestoreApp: async () => ipcRenderer.send('maximizeRestoreApp'),
    closeApp: async () => ipcRenderer.send('closeApp'),
    watchProject: async (dir: string) => ipcRenderer.invoke(API_METHODS.WATCH_PROJECT, dir),
    unwatchProject: async (dir: string) => ipcRenderer.invoke(API_METHODS.UNWATCH_PROJECT, dir),
    getLastVersion: async (dir: string) => ipcRenderer.invoke(API_METHODS.LAST_VERSION, dir),
    changePassword: async (username: string, oldPassword: string, newPassword: string) =>
        ipcRenderer.invoke(API_METHODS.CHANGE_PASSWORD, username, oldPassword, newPassword),
    saveDefaultProjectsFolder: async (dir: string) =>
        ipcRenderer.invoke(API_METHODS.SAVE_DEFAULT_PROJECTS_FOLDER, dir),
    getDefaultProjectsFolder: async () =>
        ipcRenderer.invoke(API_METHODS.GET_DEFAULT_PROJECTS_FOLDER),
    abortMerge: async (dir: string) => ipcRenderer.invoke(API_METHODS.ABORT_MERGE, dir),

    // MAIN TO RENDERER METHODS
    onProjectChanged: (callback: (data: any) => void) => {
        ipcRenderer.on(API_METHODS.PROJECT_CHANGED, (_event, data) => callback(data));
    },

    removeProjectChangedListener: () => {
        ipcRenderer.removeAllListeners(API_METHODS.PROJECT_CHANGED);
    }
};

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        // --------- Expose some API to the Renderer process ---------
        contextBridge.exposeInMainWorld('ipcRenderer', {
            on(...args: Parameters<typeof ipcRenderer.on>) {
                const [channel, listener] = args;
                return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
            },
            off(...args: Parameters<typeof ipcRenderer.off>) {
                const [channel, ...omit] = args;
                return ipcRenderer.off(channel, ...omit);
            },
            send(...args: Parameters<typeof ipcRenderer.send>) {
                const [channel, ...omit] = args;
                return ipcRenderer.send(channel, ...omit);
            },
            invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
                const [channel, ...omit] = args;
                return ipcRenderer.invoke(channel, ...omit);
            }
        });
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-expect-error (define in dts)
    window.electron = electronAPI;
    // @ts-expect-error (define in dts)
    window.api = api;
}
