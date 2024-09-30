export interface HasKey {
    getKey(): string;
}

export class Set<T extends HasKey> {
    public items: T[] = [];

    add(item: T): void {
        if (item.getKey() !== "" && !this.items.some(existing => existing.getKey() === item.getKey())) {
            this.items.push(item);
        }
    }

    has(item: T): boolean {
        return this.items.some(existing => existing.getKey() === item.getKey());
    }

    serialize(): object {
        return { items: this.items.map(item => item.serialize()) };
    }

    static deserialize<T extends HasKey>(data: any, itemDeserializer: (data: any) => T): Set<T> {
        const set = new Set<T>();
        data.items.forEach((itemData: any) => {
            set.add(itemDeserializer(itemData));
        });
        return set;
    }

}