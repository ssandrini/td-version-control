export interface HasKey {
    getKey(): string;
}

export class Set<T extends HasKey> {
    public items: T[] = [];

    add(item: T): void {
        if (!this.items.some(existing => existing.getKey() === item.getKey())) {
            this.items.push(item);
        }
    }

    has(item: T): boolean {
        return this.items.some(existing => existing.getKey() === item.getKey());
    }

}