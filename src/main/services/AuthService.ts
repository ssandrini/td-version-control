import log from 'electron-log/main.js';
import crypto from 'crypto';
import userDataManager from '../managers/UserDataManager';
import { User } from '../models/api/User';
import giteaAPIConnector from './GiteaAPIConnector';
import { HttpMethod } from '../types/HttpMethod';
import { ApiResponse } from '../errors/ApiResponse';
import { AuthToken } from '../models/api/AuthToken';
import { AuthTokenRequest } from '../models/api/AuthTokenRequest';

export class AuthService {
    async authenticate(username: string, password: string): Promise<ApiResponse> {
        log.debug('Authenticating user:', username);
        const encodedCredentials = btoa(`${username}:${password}`);
        const response: ApiResponse<AuthToken> = await giteaAPIConnector.apiRequest<AuthToken>(
            `/users/${username}/tokens`,
            HttpMethod.POST,
            this.newAuthTokenRequest(),
            {
                Authorization: `Basic ${encodedCredentials}`
            }
        );

        if (response.result) {
            log.debug('Authentication successful, saving token');
            userDataManager.saveAuthToken(response.result);
            userDataManager.saveUserCredentials(username, password);
        } else {
            log.error(`Error retrieving token due to ${response.errorCode}`);
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode!));
        }
        return Promise.resolve(ApiResponse.fromResult());
    }

    async getUserDetails(): Promise<ApiResponse<User>> {
        log.debug('Fetching user details...');
        const cachedUser = userDataManager.getUser();
        if (cachedUser) {
            log.debug(`User found in cache: ${cachedUser.username}`);
            return Promise.resolve(ApiResponse.fromResult(cachedUser));
        }
        log.debug('No cached user found, fetching from API...');
        const response: ApiResponse<User> = await giteaAPIConnector.apiRequest<User>(
            '/user',
            HttpMethod.GET
        );
        if (response.result) {
            userDataManager.saveUser(response.result);
            return Promise.resolve(ApiResponse.fromResult(response.result));
        } else {
            log.error(`Failed to fetch user details from API. Error code: ${response.errorCode}`);
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode!));
        }
    }

    async logout(): Promise<ApiResponse> {
        log.debug('Logging out user...');
        const username = userDataManager.getUser()!.username;
        const token: AuthToken | null = userDataManager.getAuthToken();

        if (token) {
            // TO DO: not working.
            try {
                const response: ApiResponse = await giteaAPIConnector.apiRequest(
                    `/users/${username}/tokens/${token.id}`,
                    HttpMethod.DELETE
                );
                if (response.result) {
                    log.debug('Token successfully deleted from API.');
                } else {
                    log.error(`Error deleting token from API: ${response.errorCode}`);
                }
            } catch (error) {
                log.error('Error during API request to delete token', error);
            }
        }

        userDataManager.clearAuthToken();
        userDataManager.clearUserCredentials();
        userDataManager.clearUser();
        log.debug('User successfully logged out. Authentication token cleared.');
        return Promise.resolve(ApiResponse.fromResult());
    }

    isLoggedIn(): Promise<ApiResponse<boolean>> {
        log.debug('Checking if user is authenticated...');
        const authToken = userDataManager.getAuthToken();
        if (authToken) {
            log.debug('User is authenticated.');
            return Promise.resolve(ApiResponse.fromResult(true));
        } else {
            log.debug('User is not authenticated.');
            return Promise.resolve(ApiResponse.fromResult(false));
        }
    }

    async changePassword(
        username: string,
        oldPassword: string,
        newPassword: string
    ): Promise<ApiResponse> {
        log.debug('Attempting to change password for user:', username);

        const authResponse = await this.authenticate(username, oldPassword);
        if (authResponse.errorCode) {
            log.error(`Authentication failed. Error code: ${authResponse.errorCode}`);
            return ApiResponse.fromErrorCode(authResponse.errorCode!);
        }

        log.debug('Old password verified, proceeding to change password');

        const changePasswordResponse = await giteaAPIConnector.apiRequest<User>(
            `/admin/users/${username}`,
            HttpMethod.PATCH,
            { password: newPassword, login_name: username, source_id: 0 }
        );

        if (!changePasswordResponse.result) {
            log.error(
                `Failed to change password for user: ${username}. Error code: ${changePasswordResponse.errorCode}`
            );
            return ApiResponse.fromErrorCode(changePasswordResponse.errorCode!);
        }

        log.debug('Password successfully changed, creating a new token');

        const newAuthResponse = await this.authenticate(username, newPassword);
        if (authResponse.errorCode) {
            log.error(
                `Failed to generate a new token after password change. Error code: ${newAuthResponse.errorCode}`
            );
            return ApiResponse.fromErrorCode(newAuthResponse.errorCode!);
        }

        log.debug('Password changed and new token created successfully');
        return ApiResponse.fromResult();
    }

    private newAuthTokenRequest(): AuthTokenRequest {
        return {
            name: crypto.randomUUID().toString(),
            scopes: ['write:user', 'write:repository']
        };
    }
}

export default new AuthService();
