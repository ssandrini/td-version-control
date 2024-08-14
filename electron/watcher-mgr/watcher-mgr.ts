import chokidar from "chokidar";
import * as path from "path";

export type WatcherCallback = (filename: string) => void;

interface Watcher {
  path: string;
  callbacks: WatcherCallback[];
}

/* TO DO:
    - Debería poder escuchar directorios?
    - Manejo de errores? 
*/
class WatcherManager {
  private watchers: Map<string, Watcher> = new Map();
  private watcherInstance = chokidar.watch([], { persistent: true });

  constructor() {
    this.watcherInstance.on("change", (filepath: string) => {
      const absolutePath = path.resolve(filepath);
      const watcher = this.watchers.get(absolutePath);
      if (watcher) {
        watcher.callbacks.forEach((callback) => callback(absolutePath));
      }
    });
  }

  /**
   * Registra un watcher para un archivo. Acepta múltiples callbacks.
   * @param filePath - Ruta del archivo a observar.
   * @param callbacks - Funciones a ejecutar cuando el archivo cambie.
   */
  public registerWatcher(filePath: string, ...callbacks: WatcherCallback[]): void {
    const absolutePath = path.resolve(filePath);
    if (!this.watchers.has(absolutePath)) {
      this.watchers.set(absolutePath, {
        path: absolutePath,
        callbacks: callbacks,
      });
      this.watcherInstance.add(absolutePath);
    } else {
      const watcher = this.watchers.get(absolutePath)!;
      watcher.callbacks.push(...callbacks);
    }
  }

  public removeWatcher(filePath: string): void {
    const absolutePath = path.resolve(filePath);
    if (this.watchers.has(absolutePath)) {
      this.watchers.delete(absolutePath);
      this.watcherInstance.unwatch(absolutePath);
    }
  }
}

export default new WatcherManager();
