import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import userDataMgr from './user-data-mgr/user-data-mgr';
import Project from '../src/models/Project';
import tdMgr from './td-mgr/td-mgr';
import watcherMgr from './watcher-mgr/watcher-mgr';

createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'img.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  ipcMain.handle('list-versions', (_, dir: string) => tdMgr.listVersions(dir));
  ipcMain.handle('create-version',(_, title: string, description:string, path: string) => tdMgr.createNewVersion(title, description, path));
  ipcMain.handle('current-version', (_, path: string) => tdMgr.getCurrentVersion(path));
  ipcMain.handle('file-picker', (_) => tdMgr.filePicker());
  ipcMain.handle('recent-projects', (_) => userDataMgr.getRecentProjects());
  ipcMain.handle('save-project', (_, project: Project) => userDataMgr.addRecentProject(project));
  ipcMain.handle('delete-project', (_, path: string) => userDataMgr.removeRecentProject(path));
  ipcMain.handle('save-td-path', (_, path: string) => userDataMgr.setTouchDesignerBinPath(path));
  ipcMain.handle('get-td-path', (_) => userDataMgr.getTouchDesignerBinPath());
  ipcMain.handle('open-toe', (_, path: string) => tdMgr.openToeFile(path));
  ipcMain.handle('create-project', (_, path: string, template: string) => tdMgr.createProjectFromTemplate(path, template));
  ipcMain.handle('watch-project', (_, path: string) => watcherMgr.registerWatcher(path, () => {
    // Registrar los callbacks que necesitemos acá
    // yo creo que los callbacks van a ser mensajes hacia el Render process que va a usar para
    // mostrar en pantalla algo cuando se detectó un cambio, por ejemplo "queres crear una nueva version?"
    console.log("Project "+ path + " changed.")
  }));
  ipcMain.handle('unwatch-project', (_, path: string) => watcherMgr.removeWatcher(path));

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
