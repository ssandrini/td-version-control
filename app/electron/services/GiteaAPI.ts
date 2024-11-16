import axios, { AxiosInstance } from "axios";
import { User } from "../models/User";
import { UserDataManager } from "../managers/UserDataManager";
import log from "electron-log/main";
import {APIError} from "../errors/APIError";
import crypto from "crypto"

export default class GiteaAPI {
    private apiClient: AxiosInstance;
    private userDataManager: UserDataManager;

    constructor(baseURL: string, userDataManager: UserDataManager) {
        this.userDataManager = userDataManager;
        this.apiClient = axios.create({
            baseURL,
            headers: { "Content-Type": "application/json" },
        });

        log.debug("Initializing GiteaAPI with baseURL:", baseURL);

        // Add auth token interceptor
        this.apiClient.interceptors.request.use(
            (config) => {
                log.debug(`Request to: ${config.url}`);
                log.debug(`Request body: ${JSON.stringify(config.data)}`);
                log.debug(`Request headers: ${JSON.stringify(config.headers)}`);

                if (config.url && config.url.includes("/tokens")) {
                    log.debug("Skipping auth token for authentication request.");
                    return config;
                }

                const token = this.userDataManager.getAuthToken();
                if (!token) {
                    log.error("Missing authentication token");
                    return Promise.reject(new APIError("Authentication token is missing.", 401));
                }
                log.debug("Adding Authorization header with token:", token);
                config.headers.Authorization = `token ${token}`;
                return config;
            },
            (error) => {
                log.error("Request interceptor error:", error);
                return Promise.reject(error);
            }
        );

        // Check errors' interceptor
        this.apiClient.interceptors.response.use(
            (response) => {
                log.debug(`Response from: ${response.config.url}`);
                log.debug(`Response status: ${response.status}`);
                log.debug(`Response data: ${JSON.stringify(response.data)}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    log.error(`Response from: ${error.response.config.url}`);
                    log.error(`Response status: ${error.response.status}`);
                    log.error(`Response body: ${JSON.stringify(error.response.data)}`);
                }
                return error.response;
            }
        );
    }

    async authenticate(username: string, password: string): Promise<void> {
        log.debug("Authenticating user:", username);
        const encodedCredentials = btoa(`${username}:${password}`);

        try {
            const response = await this.apiClient.post(
                `api/v1/users/${username}/tokens`,
                {
                    name: crypto.randomUUID().toString(),
                    scopes: ["write:user", "write:repository"],
                },
                {
                    headers: { Authorization: `Basic ${encodedCredentials}` },
                }
            );

            if (response.status < 200 || response.status >= 300) {
                log.error(`Authentication failed with status: ${response.status}`);
                return Promise.reject(new APIError("Authentication failed", response.status));
            }

            log.debug("Authentication response:", response);
            const token = response.data?.sha1;
            if (token) {
                log.debug("Authentication successful, saving token");
                this.userDataManager.saveAuthToken(token);
            } else {
                log.error("Failed to retrieve authentication token");
                return Promise.reject(new APIError("Authentication failed", 500));
            }
        } catch (error) {
            log.error("Authentication error:", error);
            return Promise.reject(new APIError("Authentication failed", 500));
        }
    }

    async getUserDetails(): Promise<User> {
        log.debug("Fetching user details...");
        try {
            const response = await this.apiClient.get("/api/v1/user");

            if (response.status !== 200) {
                log.error(`Failed to fetch user details, status code: ${response.status}`);
                return Promise.reject(new APIError("Get user failed", response.status));
            }

            log.debug("User details response:", response);
            const data = response.data;
            log.debug("User details fetched successfully:", data);

            return new User(
                data.id,
                data.username || data.login,
                data.email,
                data.avatar_url
            );
        } catch (error) {
            log.error("Error fetching user details:", error);
            return Promise.reject(new APIError("Get user failed", 500));
        }
    }


}
