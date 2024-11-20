import log from 'electron-log/main.js';
import giteaAPIConnector from './GiteaAPIConnector';
import { HttpMethod } from '../types/HttpMethod';
import { ApiResponse } from '../errors/ApiResponse';
import { User } from '../models/api/User';

export class UserService {
    async searchUser(username: string): Promise<ApiResponse<User>> {
        log.debug(`Searching for user: ${username}`);
        const response: ApiResponse<{ data: User[] }> = await giteaAPIConnector.apiRequest<{
            data: User[];
        }>(`/users/search?q=${encodeURIComponent(username)}`, HttpMethod.GET);

        if (response.result && response.result.data.length > 0) {
            return Promise.resolve(ApiResponse.fromResult(response.result.data[0]));
        } else if (response.errorCode) {
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode));
        }
        return Promise.resolve(ApiResponse.fromResult());
    }
}

export default new UserService();
