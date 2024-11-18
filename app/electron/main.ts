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
import { TDState } from "./models/TDState";
import {TDMergeResult} from "./models/TDMergeResult";
import authService from "./services/AuthService"
import remoteRepoService from "./services/RemoteRepoService";
import {Version} from "./models/Version";

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

  const minWidth = 1400;
  const minHeight = 850;

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
  const tracker = new SimpleGitTracker();
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

const setupProject = <T, S>(projectManager: ProjectManager<T, S>): void => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle(API_METHODS.FILE_PICKER, (_) => filePicker());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle(API_METHODS.GET_TD_PATH, (_) => userDataMgr.getTouchDesignerBinPath());

  ipcMain.handle(API_METHODS.OPEN_TD, (_, path: string) => openToeFile(path));

  ipcMain.handle(API_METHODS.CREATE_PROJECT, async (_, dir: string, name: string, remote: boolean, src?: string) => {
    let initialVersion: Version;
    let remoteUrl: string = "";
    log.debug("params: ", dir, name, remote, src);
    if (remote) {
      const response = await remoteRepoService.createRepository(name);
      if (response.result) {
        remoteUrl = response.result;
        initialVersion = await projectManager.init(dir, remoteUrl, src);
      } else {
        // TO DO: fixme
        return Promise.reject(new Error('Unexpected error'));
      }
    } else {
      initialVersion = await projectManager.init(dir, undefined, src);
    }

    if (src) {
      try {
        new URL(src);
        remoteUrl = src;
      } catch (error) {
      }
    }

    const newProject: Project = {
      name: name,
      owner: initialVersion.author.name,
      lastModified: new Date().toLocaleDateString(),
      lastVersion: initialVersion.name,
      path: dir,
      remote: remoteUrl
    };
    userDataMgr.addRecentProject(newProject);
    return Promise.resolve(newProject);
  });

  ipcMain.handle(API_METHODS.GO_TO_VERSION, (_, dir: string, versionId: string) =>
    projectManager.goToVersion(dir, versionId)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle(API_METHODS.GET_TEMPLATES, (_) => getTemplates());

  // Remote handling
  ipcMain.handle(API_METHODS.PULL, async (_, dir: string) => {
    const result = await projectManager.pull(dir) as TDMergeResult;
    return result.serialize();
  });

  ipcMain.handle(API_METHODS.PUSH, (_, dir: string) => projectManager.push(dir));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  ipcMain.handle(API_METHODS.FINISH_MERGE, (_, dir: string, state: S) => projectManager.finishMerge(dir, state));
  // -----*-----

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

  ipcMain.handle(API_METHODS.GET_STATE, async (_, path: string, versionId?: string) => {
    log.debug('get state main handler');
    const state = await projectManager.getVersionState(path, versionId) as unknown as TDState;
    return state.serialize();
  });

  ipcMain.handle(API_METHODS.AUTHENTICATE_USER, async (_, username: string, password: string) => {
    return authService.authenticate(username, password);
  });

  ipcMain.handle(API_METHODS.GET_USER, async () => {
    return authService.getUserDetails();
  });

  ipcMain.handle(API_METHODS.GET_REMOTE_PROJECTS, async () => {
    return remoteRepoService.getProjects();
  })

  ipcMain.handle(API_METHODS.LOGOUT, async () => {
    return authService.logout();
  })

  ipcMain.handle(API_METHODS.GET_COLLABORATORS, async(_, owner: string, projectName: string) => {
    return remoteRepoService.getCollaborators(owner, projectName);
  })

  ipcMain.handle(API_METHODS.ADD_COLLABORATOR, async(_, owner: string, projectName: string, collaborator: string, permissions: "read" | "write" | "admin") => {
    return remoteRepoService.addCollaborator(owner, projectName, collaborator, permissions);
  })

  ipcMain.handle(API_METHODS.REMOVE_COLLABORATOR, async(_, owner: string, projectName: string, collaborator: string) => {
    return remoteRepoService.removeCollaborator(owner, projectName, collaborator);
  })
};
