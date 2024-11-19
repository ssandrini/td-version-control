import { contextBridge, ipcRenderer } from 'electron';
import Project from '../main/models/Project';
import { API_METHODS } from '../main/apiMethods';
import { TDState } from '../main/models/TDState';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
    listVersions: async (dir: string) => ipcRenderer.invoke(API_METHODS.LIST_VERSIONS, dir),
    filePicker: async () => ipcRenderer.invoke(API_METHODS.FILE_PICKER),
    getRecentProjects: async () => ipcRenderer.invoke(API_METHODS.RECENT_PROJECTS),
    saveProject: async (project: Project) => ipcRenderer.invoke(API_METHODS.SAVE_PROJECT, project),
    deleteProject: async (path: string) => ipcRenderer.invoke(API_METHODS.DELETE_PROJECT, path),
    saveTDBinPath: async (path: string) => ipcRenderer.invoke(API_METHODS.SAVE_TD_PATH, path),
    getTDBinPath: async () => ipcRenderer.invoke(API_METHODS.GET_TD_PATH),
    openToe: async (path: string) => ipcRenderer.invoke(API_METHODS.OPEN_TD, path),
    createProject: async (dir: string, name: string, remote: boolean, src?: string) =>
        ipcRenderer.invoke(API_METHODS.CREATE_PROJECT, dir, name, remote, src),
    createNewVersion: async (dir: string, name: string, description: string) =>
        ipcRenderer.invoke(API_METHODS.CREATE_VERSION, dir, name, description),
    getCurrentVersion: async (path: string) =>
        ipcRenderer.invoke(API_METHODS.CURRENT_VERSION, path),
    goToVersion: async (dir: string, versionId: string) =>
        ipcRenderer.invoke(API_METHODS.GO_TO_VERSION, dir, versionId),
    getTemplates: async () => ipcRenderer.invoke(API_METHODS.GET_TEMPLATES),
    getState: async (path: string, versionId?: string) =>
        ipcRenderer.invoke(API_METHODS.GET_STATE, path, versionId),
    pull: async (dir: string) => ipcRenderer.invoke(API_METHODS.PULL, dir),
    push: async (dir: string) => ipcRenderer.invoke(API_METHODS.PUSH, dir),
    finishMerge: async (dir: string, state: TDState) =>
        ipcRenderer.invoke(API_METHODS.FINISH_MERGE, dir, state),
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
        ipcRenderer.invoke(API_METHODS.REMOVE_COLLABORATOR, owner, projectName, collaborator)
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
