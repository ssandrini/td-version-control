export class TrackerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TrackerError';
    }
}