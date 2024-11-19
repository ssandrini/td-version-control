export class MissingFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MissingFileError';
    }
}
