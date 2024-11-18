export class TDError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TDError';
    }
}