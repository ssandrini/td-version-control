export class ChangeSet<T> {
    public added: T[];
    public modified: T[];
    public deleted: T[];
  
    constructor() {
      this.added = [];
      this.modified = [];
      this.deleted = [];
    }

    static fromValues<T>(added: T[], modified: T[], deleted: T[]): ChangeSet<T> {
        const changeset = new ChangeSet<T>();
        changeset.added = added;
        changeset.modified = modified;
        changeset.deleted = deleted;
        return changeset;
    }

    public addToAdded(change: T): void {
        this.added.push(change);
    }

    public addToModified(change: T): void {
        this.modified.push(change);
    }

    public addToDeleted(change: T): void {
        this.deleted.push(change);
    }
}
