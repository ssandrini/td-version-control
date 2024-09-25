import { HasKey, Set } from "../utils/Set";

export class ChangeSet<T extends HasKey> {
    public added: Set<T>;
    public modified: Set<T>;
    public deleted: Set<T>;

    constructor() {
        this.added = new Set<T>();
        this.modified = new Set<T>();
        this.deleted = new Set<T>();
    }

    static fromValues<T extends HasKey>(added: T[], modified: T[], deleted: T[]): ChangeSet<T> {
        const changeset = new ChangeSet<T>();
        added.forEach(item => changeset.added.add(item));
        modified.forEach(item => changeset.modified.add(item));
        deleted.forEach(item => changeset.deleted.add(item));
        return changeset;
    }
}