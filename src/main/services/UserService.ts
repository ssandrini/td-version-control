import log from 'electron-log/main.js';
import giteaAPIConnector from './GiteaAPIConnector';
import { HttpMethod } from '../types/HttpMethod';
import { ApiResponse } from '../errors/ApiResponse';
import { User } from '../models/api/User';

export interface RegisterUserRequest {
    username: string;
    email: string;
    password: string;
}

export class UserService {
    async searchUser(username: string): Promise<ApiResponse<User[]>> {
        log.debug(`Searching for users with username: ${username}`);
        const response: ApiResponse<{ data: User[] }> = await giteaAPIConnector.apiRequest<{
            data: User[];
        }>(`/users/search?q=${encodeURIComponent(username)}`, HttpMethod.GET);

        if (response.result && response.result.data && response.result.data.length > 0) {
            const users = response.result.data;
            return Promise.resolve(ApiResponse.fromResult(users));
        } else if (response.errorCode) {
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode));
        }
        return Promise.resolve(ApiResponse.fromResult([]));
    }

    async registerUser(request: RegisterUserRequest): Promise<ApiResponse<User>> {
        log.debug(`Registering new user: ${request.username}`);
        return giteaAPIConnector.apiRequest<User>('/admin/users', HttpMethod.POST, {
            username: request.username,
            email: request.email,
            password: request.password,
            must_change_password: false
        });
    }
}

export default new UserService();
