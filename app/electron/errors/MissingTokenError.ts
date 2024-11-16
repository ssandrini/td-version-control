export class MissingTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MissingTokenError";
    }
}
