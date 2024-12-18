import { app, BrowserWindow, ipcMain, screen, session } from 'electron';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { createRequire } from 'node:module';
import path from 'node:path';
import userDataMgr from './managers/UserDataManager';
import Project from './models/Project';
import watcherMgr from './managers/WatcherManager';
import log from 'electron-log/main.js';
import { ProjectManager } from './managers/interfaces/ProjectManager';
import { TDProjectManager } from './managers/TDProjectManager';
import { SimpleGitTracker } from './trackers/SimpleGitTracker';
import { TDProcessor } from './processors/TDProcessor';
import { API_METHODS } from './apiMethods';
import {
    createProjectDirectory,
    filePicker,
    findFileByExt,
    getTemplates,
    openDirectory,
    openToeFile,
    verifyUrl
} from './utils/utils';
import { TDState } from './models/TDState';
import { TDMergeResult } from './models/TDMergeResult';
import authService from './services/AuthService';
import remoteRepoService from './services/RemoteRepoService';
import { Version } from './models/Version';
import userService, { RegisterUserRequest } from './services/UserService';
// @ts-ignore
import appIcon from '../../resources/icon.ico?asset';
import { APIErrorCode } from './errors/APIErrorCode';
import { ApiResponse } from './errors/ApiResponse';

createRequire(import.meta.url);

process.env.APP_ROOT = path.join(__dirname, '..');
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, 'resources')
    : RENDERER_DIST;
let win: BrowserWindow | null;

function createWindow() {
    log.initialize();
    log.info('Initializing app...');

    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    const minWidth = 1000;
    const minHeight = 550;

    const finalWidth = Math.min(screenWidth, minWidth);
    const finalHeight = Math.min(screenHeight, minHeight);

    const iconPath =
        process.platform === 'darwin' ? path.join(__dirname, '../../resources/icon.icns') : appIcon;

    win = new BrowserWindow({
        icon: iconPath,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            allowRunningInsecureContent: true // TO DO: cambiar cuando usemos HTTPS
        },
        show: false,
        autoHideMenuBar: true,
        width: finalWidth,
        height: finalHeight,
        minWidth: finalWidth,
        minHeight: finalHeight
    });

    win.setBackgroundColor('#1b1d23');

    win.maximize();

    /* --- Custom Title Bar actions --- */
    //minimize app
    ipcMain.on('minimizeApp', () => {
        console.log('clicked on minimize btn');
        win?.minimize();
    });

    //maximize app
    ipcMain.on('maximizeRestoreApp', () => {
        console.log('clicked on maximize restore btn');
        //check status of the window
        if (win?.isMaximized()) {
            console.log('--setting restore');
            win?.restore();
        } else {
            console.log('--setting maximize');
            win?.maximize();
        }
    });

    //close app
    ipcMain.on('closeApp', () => {
        console.log('clicked on close btn');
        win?.close();
    });

    //win.on is used to check events triggers
    win.on('maximize', () => {
        win?.webContents.send('isMaximized'); //send an event to the ui
    });

    win.on('restore', () => {
        win?.webContents.send('isRestored');
    });
    /* --------------------------------- */

    const tracker = new SimpleGitTracker();
    const processor = new TDProcessor();
    const projectManager = new TDProjectManager(processor, tracker, '.mar');

    setupProject(projectManager);

    win.on('ready-to-show', () => {
        win?.show();
    });

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}

app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = details.responseHeaders || {};
        responseHeaders['Content-Security-Policy'] = [
            "img-src 'self' https://api.mariana-api.com.ar data:"
        ];
        callback({ responseHeaders });
    });

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    // IPC test
    ipcMain.on('ping', () => console.log('pong'));

    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const setupProject = <T, S>(projectManager: ProjectManager<T, S>): void => {
    ipcMain.handle(API_METHODS.LIST_VERSIONS, (_, dir: string) => projectManager.listVersions(dir));

    ipcMain.handle(
        API_METHODS.CREATE_VERSION,
        (_, dir: string, name: string, description: string) =>
            projectManager.createVersion(dir, name, description)
    );

    ipcMain.handle(API_METHODS.ADD_TAG, (_, dir: string, versionId: string, tag: string) =>
        projectManager.addTag(dir, versionId, tag)
    );

    ipcMain.handle(API_METHODS.REMOVE_TAG, (_, dir: string, tag: string) =>
        projectManager.removeTag(dir, tag)
    );

    ipcMain.handle(API_METHODS.CURRENT_VERSION, (_, dir: string) =>
        projectManager.currentVersion(dir)
    );

    ipcMain.handle(API_METHODS.HAS_CHANGES, (_, dir: string) => projectManager.hasChanges(dir));

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

    ipcMain.handle(API_METHODS.CHECK_DEPENDENCIES, (_) => {
        if (process.platform != 'win32' && process.platform != 'darwin') return Promise.resolve([]);
        return projectManager.checkDependencies();
    });

    ipcMain.handle(API_METHODS.OPEN_TD, (_, path: string) => openToeFile(path));

    ipcMain.handle(
        API_METHODS.CREATE_PROJECT,
        async (
            _,
            dir: string,
            name: string,
            description: string,
            createRemoteRepo: boolean,
            src?: string
        ) => {
            let completePath = '';
            try {
                completePath = await createProjectDirectory(dir, name);
            } catch (error: any) {
                return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.LocalError));
            }

            let initialVersion: Version;
            let remoteUrl: string = '';
            if (createRemoteRepo) {
                const response = await remoteRepoService.createRepository(name, description);
                if (response.result) {
                    remoteUrl = response.result;
                    try {
                        initialVersion = await projectManager.init(completePath, remoteUrl, src);
                    } catch (err) {
                        log.error('Failed to initialize project locally:', err);
                        return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.LocalError));
                    }
                } else {
                    return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode!));
                }
            } else {
                try {
                    initialVersion = await projectManager.init(completePath, undefined, src);
                    if (verifyUrl(src!)) {
                        remoteUrl = src!;
                    }
                } catch (err) {
                    log.error('Failed to initialize project locally:', err);
                    return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.LocalError));
                }
            }

            const newProject: Project = {
                name: name,
                owner: initialVersion.author.name,
                path: completePath,
                remote: remoteUrl,
                description: description
            };
            userDataMgr.addRecentProject(newProject);
            return Promise.resolve(ApiResponse.fromResult(newProject));
        }
    );

    ipcMain.handle(API_METHODS.GO_TO_VERSION, (_, dir: string, versionId: string) =>
        projectManager.goToVersion(dir, versionId)
    );

    ipcMain.handle(API_METHODS.DISCARD_CHANGES, (_, dir: string) =>
        projectManager.discardChanges(dir)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(API_METHODS.GET_TEMPLATES, (_) => getTemplates());

    // Remote handling
    ipcMain.handle(
        API_METHODS.PUBLISH,
        async (_, dir: string, name: string, description: string) => {
            return projectManager.publish(dir, name, description);
        }
    );

    ipcMain.handle(API_METHODS.IS_PUBLISHED, async (_, dir: string) =>
        projectManager.isPublished(dir)
    );

    ipcMain.handle(API_METHODS.PULL, async (_, dir: string) => {
        const result = (await projectManager.pull(dir)) as TDMergeResult;
        return result.serialize();
    });

    ipcMain.handle(API_METHODS.PUSH, async (_, dir: string) => {
        try {
            await projectManager.push(dir);
        } catch (e: any) {
            if (e.message.includes('before pushing')) {
                return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.LocalError));
            } else {
                return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.CommunicationError));
            }
        }
        return Promise.resolve(ApiResponse.fromResult());
    });

    ipcMain.handle(
        API_METHODS.FINISH_MERGE,
        (_, dir: string, state: T, versionName: string, description: string) =>
            projectManager.finishMerge(dir, state, versionName, description)
    );
    // -----*-----

    ipcMain.handle(API_METHODS.WATCH_PROJECT, (_, dir: string) => {
        const toePath = path.join(dir, findFileByExt('toe', dir)!);
        log.debug(`Adding ${toePath} to watcher`);
        watcherMgr.registerWatcher(toePath!, async () => {
            const currentVersion: Version = await projectManager.currentVersion(dir);
            const lastVersion: Version = await projectManager.lastVersion(dir);
            log.debug('currentVersionId: ', currentVersion.id);
            log.debug('lastVersionId: ', lastVersion.id);
            const hasChanges: boolean = await projectManager.hasChanges(dir);

            if (currentVersion.id === lastVersion.id && hasChanges) {
                win?.webContents.send(API_METHODS.PROJECT_CHANGED, { message: 'Project changed' });
            }
        });
    });

    ipcMain.handle(API_METHODS.UNWATCH_PROJECT, (_, dir: string) => {
        const toePath = path.join(dir, findFileByExt('toe', dir)!);
        log.debug(`Adding ${toePath} to watcher`);
        watcherMgr.removeWatcher(toePath);
    });

    ipcMain.handle(API_METHODS.GET_STATE, async (_, path: string, versionId?: string) => {
        log.debug('get state main handler');
        const state = (await projectManager.getVersionState(path, versionId)) as unknown as TDState;
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
    });

    ipcMain.handle(API_METHODS.LOGOUT, async () => {
        return authService.logout();
    });

    ipcMain.handle(API_METHODS.GET_COLLABORATORS, async (_, owner: string, projectName: string) => {
        return remoteRepoService.getCollaborators(owner, projectName);
    });

    ipcMain.handle(
        API_METHODS.ADD_COLLABORATOR,
        async (
            _,
            owner: string,
            projectName: string,
            collaborator: string,
            permissions: 'read' | 'write' | 'admin'
        ) => {
            return remoteRepoService.addCollaborator(owner, projectName, collaborator, permissions);
        }
    );

    ipcMain.handle(
        API_METHODS.REMOVE_COLLABORATOR,
        async (_, owner: string, projectName: string, collaborator: string) => {
            return remoteRepoService.removeCollaborator(owner, projectName, collaborator);
        }
    );

    ipcMain.handle(API_METHODS.OPEN_DIRECTORY, async (_, dir: string) => {
        return openDirectory(dir);
    });

    ipcMain.handle(API_METHODS.SEARCH_USER, async (_, username: string) => {
        return userService.searchUser(username);
    });

    ipcMain.handle(API_METHODS.REGISTER, async (_, req: RegisterUserRequest) => {
        return userService.registerUser(req);
    });

    ipcMain.handle(API_METHODS.GET_MERGE_STATUS, async (_, dir: string) => {
        return projectManager.getMergeStatus(dir);
    });

    ipcMain.handle(API_METHODS.LAST_VERSION, async (_, dir: string) => {
        return projectManager.lastVersion(dir);
    });

    ipcMain.handle(
        API_METHODS.CHANGE_PASSWORD,
        async (_, username: string, oldPassword: string, newPassword: string) => {
            return authService.changePassword(username, oldPassword, newPassword);
        }
    );

    ipcMain.handle(API_METHODS.SAVE_DEFAULT_PROJECTS_FOLDER, async (_, path: string) => {
        return userDataMgr.saveDefaultProjectsLocation(path);
    });

    ipcMain.handle(API_METHODS.GET_DEFAULT_PROJECTS_FOLDER, async () => {
        return userDataMgr.getDefaultProjectsLocation();
    });

    ipcMain.handle(API_METHODS.ABORT_MERGE, async (_, dir: string) => {
        return projectManager.abortMerge(dir);
    });
};
