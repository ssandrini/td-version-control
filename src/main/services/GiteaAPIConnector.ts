import axios, { AxiosInstance } from 'axios';
import log from 'electron-log/main.js';
import {
    addAuthenticationTokenInterceptor,
    errorResponseInterceptor,
    successResponseInterceptor
} from './Interceptors';
import { ApiResponse } from '../errors/ApiResponse';
import { HttpMethod } from '../types/HttpMethod';
import missingAuthenticationToken from '../errors/MissingAuthenticationToken';
import { APIErrorCode } from '../errors/APIErrorCode';

export class GiteaAPIConnector {
    private readonly apiClient: AxiosInstance;
    private readonly baseURL: string = 'https://api.mariana-api.com.ar/api/v1/';

    constructor() {
        this.apiClient = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json' }
        });
        log.debug('Initializing GiteaAPI with baseURL:', this.baseURL);
        this.apiClient.interceptors.request.use(addAuthenticationTokenInterceptor);
        this.apiClient.interceptors.response.use(
            successResponseInterceptor,
            errorResponseInterceptor
        );
    }

    async apiRequest<T>(
        url: string,
        method: HttpMethod,
        data?: any,
        headers?: Record<string, string>,
        params?: Record<string, string | number>
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.apiClient({
                method,
                url,
                data,
                headers,
                params
            });
            return Promise.resolve(ApiResponse.fromResult(response.data));
        } catch (error: any) {
            if (error === missingAuthenticationToken) {
                return Promise.resolve(
                    ApiResponse.fromErrorCode(APIErrorCode.MissingAuthenticationToken)
                );
            }
            if (error.response) {
                log.error(`Response status: ${error.response.status}`);
                return Promise.resolve(
                    ApiResponse.fromErrorCode(this.mapStatusCode(error.response.status))
                );
            } else if (error.request) {
                return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.CommunicationError));
            }

            return Promise.resolve(ApiResponse.fromErrorCode(APIErrorCode.UnknownError));
        }
    }

    private mapStatusCode(statusCode: number): APIErrorCode {
        switch (statusCode) {
            case 400:
                return APIErrorCode.BadRequest;
            case 401:
                return APIErrorCode.InvalidCredentials;
            case 404:
                return APIErrorCode.NotFound;
            case 409:
                return APIErrorCode.EntityAlreadyExists;
            case 422:
                return APIErrorCode.UnprocessableEntity;
            case 503:
                return APIErrorCode.CommunicationError;
            default:
                return APIErrorCode.UnknownError;
        }
    }
}

export default new GiteaAPIConnector();
