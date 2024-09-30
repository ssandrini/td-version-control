/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import userDataMgr from "./managers/UserDataManager";
import Project from "./models/Project";
import watcherMgr from "./managers/WatcherManager"
import log from "electron-log/main";
import { ProjectManager } from "./managers/interfaces/ProjectManager";
import { TDProjectManager } from "./managers/TDProjectManager";
import { SimpleGitTracker } from "./trackers/SimpleGitTracker";
import { TDProcessor } from "./processors/TDProcessor";
import { API_METHODS } from "./apiMethods";
import { filePicker, openToeFile, getTemplates } from "./utils/utils";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "resources")
  : RENDERER_DIST;
let win: BrowserWindow | null;

function createWindow() {
  log.initialize();
  log.info("Initializing app...");

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const minWidth = 1000;
  const minHeight = 700;

  const finalWidth = Math.min(screenWidth, minWidth);
  const finalHeight = Math.min(screenHeight, minHeight);

  win = new BrowserWindow({
    icon: "public/img.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
    width: finalWidth,
    height: finalHeight,
    minWidth: finalWidth,
    minHeight: finalHeight,
  });

  win.maximize();
  // TODO: get user correctly
  const tracker = new SimpleGitTracker("tduser", "tduser@example.com");
  const processor = new TDProcessor();
  const projectManager = new TDProjectManager(processor, tracker, ".mar");

  setupProject(projectManager);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

const setupProject = (projectManager: ProjectManager): void => {
  ipcMain.handle(API_METHODS.LIST_VERSIONS, (_, dir: string) =>
    projectManager.listVersions(dir)
  );

  ipcMain.handle(
    API_METHODS.CREATE_VERSION,
    (_, dir: string, name: string, description: string) =>
      projectManager.createVersion(dir, name, description)
  );

  ipcMain.handle(API_METHODS.CURRENT_VERSION, (_, dir: string) =>
    projectManager.currentVersion(dir)
  );

  ipcMain.handle(API_METHODS.FILE_PICKER, (_) => filePicker());

  ipcMain.handle(API_METHODS.RECENT_PROJECTS, (_) => userDataMgr.getRecentProjects());

  ipcMain.handle(API_METHODS.SAVE_PROJECT, (_, project: Project) =>
    userDataMgr.addRecentProject(project)
  );

  ipcMain.handle(API_METHODS.DELETE_PROJECT, (_, path: string) =>
    userDataMgr.removeRecentProject(path)
  );

  ipcMain.handle(API_METHODS.SAVE_TD_PATH, (_, path: string) =>
    userDataMgr.setTouchDesignerBinPath(path)
  );

  ipcMain.handle(API_METHODS.GET_TD_PATH, (_) => userDataMgr.getTouchDesignerBinPath());

  ipcMain.handle(API_METHODS.OPEN_TD, (_, path: string) => openToeFile(path));

  ipcMain.handle(API_METHODS.CREATE_PROJECT, (_, dir: string, src?: string) =>
    projectManager.init(dir, src)
  );

  ipcMain.handle(API_METHODS.GO_TO_VERSION, (_, dir: string, versionId: string) =>
    projectManager.goToVersion(dir, versionId)
  );

  ipcMain.handle(API_METHODS.GET_TEMPLATES, (_) => getTemplates());

  ipcMain.handle(API_METHODS.COMPARE, async (_, dir: string, versionId: string) => {
    log.debug('Compare main handler');
    const changeSet = await projectManager.compare(dir, versionId);
    return changeSet.serialize();
});

  ipcMain.on(API_METHODS.WATCH_PROJECT, (_, path: string) =>
    watcherMgr.registerWatcher(path, () => {
      // Registrar los callbacks que necesitemos acá
      // yo creo que los callbacks van a ser mensajes hacia el Render process que va a usar para
      // mostrar en pantalla algo cuando se detectó un cambio, por ejemplo "queres crear una nueva version?"
      log.debug("Project " + path + " changed.");
    })
  );

  ipcMain.on(API_METHODS.UNWATCH_PROJECT, (_, path: string) =>
    watcherMgr.removeWatcher(path)
  );
};
