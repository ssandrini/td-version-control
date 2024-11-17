import log from "electron-log/main";
import crypto from "crypto";
import userDataManager from "../managers/UserDataManager";
import {User} from "../models/User";
import giteaAPIConnector from "./GiteaAPIConnector";
import {HttpMethod} from "../types/HttpMethod";
import {ApiResponse} from "../errors/ApiResponse";

export class AuthService {
    async authenticate(username: string, password: string): Promise<ApiResponse> {
        log.debug("Authenticating user:", username);
        const encodedCredentials = btoa(`${username}:${password}`);
        const response = await giteaAPIConnector.apiRequest<{ sha1: string }>(
            `/users/${username}/tokens`,
            HttpMethod.POST,
            {
                name: crypto.randomUUID().toString(),
                scopes: ["write:user", "write:repository"],
            },
            {
                Authorization: `Basic ${encodedCredentials}`,
            }
        );

        if (response.result) {
            log.debug("Authentication successful, saving token");
            userDataManager.saveAuthToken(response.result.sha1);
        } else {
            log.error(`Error retrieving token due to ${response.errorCode}`);
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode!));
        }
        return Promise.resolve(ApiResponse.fromResult());
    }

    async getUserDetails(): Promise<ApiResponse<User>> {
        log.debug("Fetching user details...");
        return giteaAPIConnector.apiRequest<User>('/user', HttpMethod.GET);
    }

    async logout(): Promise<ApiResponse> {
        log.debug("Logging out user...");
        // TO DO: api call DELETE token
        userDataManager.clearAuthToken();
        log.debug("User successfully logged out. Authentication token cleared.");
        return Promise.resolve(ApiResponse.fromResult());
    }
}

export default new AuthService();