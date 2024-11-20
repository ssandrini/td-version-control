import { APIErrorCode } from './APIErrorCode';

export class ApiResponse<T = void> {
    private constructor(
        public readonly result: T | null,
        public readonly errorCode: APIErrorCode | null
    ) {}

    static fromResult<T = void>(result: T = undefined as unknown as T): ApiResponse<T> {
        return new ApiResponse<T>(result, null);
    }

    static fromErrorCode<T = void>(errorCode: APIErrorCode): ApiResponse<T> {
        return new ApiResponse<T>(null, errorCode);
    }
}
