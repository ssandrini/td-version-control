export class TagError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TagError';
    }
}
