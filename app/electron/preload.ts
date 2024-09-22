import { ipcRenderer, contextBridge } from 'electron'
import Project from './models/Project'
import { API_METHODS } from './apiMethods'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

contextBridge.exposeInMainWorld('api', {
  listVersions:       async (dir: string) => ipcRenderer.invoke(API_METHODS.LIST_VERSIONS, dir),
  compareVersions:    async (dir: string, to?: string) => {
    console.debug('Preload compare')
    return ipcRenderer.invoke(API_METHODS.COMPARE, dir, to);
  },
  filePicker:         async () => ipcRenderer.invoke(API_METHODS.FILE_PICKER),
  getRecentProjects:  async () => ipcRenderer.invoke(API_METHODS.RECENT_PROJECTS),
  saveProject:        async (project: Project) => ipcRenderer.invoke(API_METHODS.SAVE_PROJECT, project),
  deleteProject:      async (path: string) => ipcRenderer.invoke(API_METHODS.DELETE_PROJECT, path),
  saveTDBinPath:      async (path: string) => ipcRenderer.invoke(API_METHODS.SAVE_TD_PATH, path),
  getTDBinPath:       async() => ipcRenderer.invoke(API_METHODS.GET_TD_PATH),
  openToe:            async(path: string) => ipcRenderer.invoke(API_METHODS.OPEN_TD, path),
  createProject:      async(dir: string, src?: string) => ipcRenderer.invoke(API_METHODS.CREATE_PROJECT, dir, src),
  createNewVersion:   async(dir: string, name:string, description: string) => ipcRenderer.invoke(API_METHODS.CREATE_VERSION, dir, name, description),
  getCurrentVersion:  async(path: string) => ipcRenderer.invoke(API_METHODS.CURRENT_VERSION, path),
  goToVersion:        async(dir: string, versionId: string) => ipcRenderer.invoke(API_METHODS.GO_TO_VERSION, dir, versionId),
  getTemplates:       async() => ipcRenderer.invoke(API_METHODS.GET_TEMPLATES),
});