import chokidar from "chokidar";
import * as path from "path";
import log from 'electron-log/main';

export type WatcherCallback = (filename: string) => void;

interface Watcher {
  path: string;
  callbacks: WatcherCallback[];
}

class WatcherManager {
  private watchers: Map<string, Watcher> = new Map();
  private watcherInstance = chokidar.watch([], { persistent: true });

  constructor() {
    log.info('WatcherManager initialized.');

    this.watcherInstance.on("change", (filepath: string) => {
      const absolutePath = path.resolve(filepath);
      log.info(`File change detected: ${absolutePath}`);

      const watcher = this.watchers.get(absolutePath);
      if (watcher) {
        log.info(`Executing ${watcher.callbacks.length} callback(s) for: ${absolutePath}`);
        watcher.callbacks.forEach((callback) => callback(absolutePath));
      } else {
        log.warn(`No watcher found for: ${absolutePath}`);
      }
    });

    this.watcherInstance.on('error', (error) => {
      log.error('Error in WatcherManager:', error);
    });
  }

  /**
   * Registers a watcher for a file and accepts multiple callbacks.
   * @param {string} filePath - The path of the file to watch.
   * @param {WatcherCallback[]} callbacks - Functions to execute when the file changes.
   */
  public registerWatcher(filePath: string, ...callbacks: WatcherCallback[]): void {
    const absolutePath = path.resolve(filePath);
    log.info(`Registering watcher for: ${absolutePath}`);

    if (!this.watchers.has(absolutePath)) {
      this.watchers.set(absolutePath, {
        path: absolutePath,
        callbacks: callbacks,
      });
      this.watcherInstance.add(absolutePath);
      log.info(`Watcher registered for: ${absolutePath}`);
    } else {
      const watcher = this.watchers.get(absolutePath)!;
      watcher.callbacks.push(...callbacks);
      log.info(`Added callbacks to existing watcher for: ${absolutePath}`);
    }
  }

  /**
   * Removes a watcher for a given file path.
   * @param {string} filePath - The path of the file to stop watching.
   */
  public removeWatcher(filePath: string): void {
    const absolutePath = path.resolve(filePath);
    log.info(`Removing watcher for: ${absolutePath}`);

    if (this.watchers.has(absolutePath)) {
      this.watchers.delete(absolutePath);
      this.watcherInstance.unwatch(absolutePath);
      log.info(`Watcher removed for: ${absolutePath}`);
    } else {
      log.warn(`No watcher found to remove for: ${absolutePath}`);
    }
  }

  /**
   * Returns a list of all currently registered watchers.
   * @returns {string[]} - An array of file paths being watched.
   */
  public getWatchers(): string[] {
    const watcherPaths = Array.from(this.watchers.keys());
    log.info(`Returning list of ${watcherPaths.length} watcher(s).`);
    return watcherPaths;
  }
}

export default new WatcherManager();
