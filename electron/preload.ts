import { ipcRenderer, contextBridge } from 'electron'
import Project from '../src/models/Project'

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
  listVersions: async (dir: string) => ipcRenderer.invoke('list-versions', dir),
  filePicker: async () => ipcRenderer.invoke('file-picker'),
  getRecentProjects: async () => ipcRenderer.invoke('recent-projects'),
  saveProject: async (project: Project) => ipcRenderer.invoke('save-project', project),
  deleteProject: async (path: string) => ipcRenderer.invoke('delete-project', path),
  saveTDBinPath: async (path: string) => ipcRenderer.invoke('save-td-path', path),
  getTDBinPath: async() => ipcRenderer.invoke('get-td-path'),
  openToe: async(path: string) => ipcRenderer.invoke('open-toe', path),
});