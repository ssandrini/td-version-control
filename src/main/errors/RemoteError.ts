import { APIErrorCode } from './APIErrorCode';

export class RemoteError extends Error {
    readonly errorCode: APIErrorCode;

    constructor(message: string, errorCode: APIErrorCode) {
        super(message);
        this.errorCode = errorCode;
        this.name = 'RemoteError';
    }
}
