import axios, { AxiosInstance } from "axios";
import { MissingTokenError } from "../errors/MissingTokenError";
import { TokenExpiredError } from "../errors/TokenExpiredError";
import { APIError } from "../errors/APIError";
import { User } from "../models/User";
import {UserDataManager} from "../managers/UserDataManager";

export default class GiteaAPI {
    private apiClient: AxiosInstance;
    private userDataManager: UserDataManager;

    constructor(baseURL: string, userDataManager: UserDataManager) {
        this.userDataManager = userDataManager;
        this.apiClient = axios.create({
            baseURL,
            headers: { "Content-Type": "application/json" },
        });

        // Add auth token interceptor
        this.apiClient.interceptors.request.use(
            (config) => {
                const token = this.userDataManager.getAuthToken();
                if (!token) {
                    throw new MissingTokenError("Authentication token is missing.");
                }
                config.headers.Authorization = `token ${token}`;
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Check errors' interceptor.
        this.apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error instanceof MissingTokenError) {
                    throw error;
                }

                if (error.response?.status === 401) {
                    this.userDataManager.clearAuthToken();
                    throw new TokenExpiredError("Authentication token has expired or is invalid.");
                }

                throw new APIError(
                    error.response?.data?.message || "An error occurred while accessing the API.",
                    error.response?.status
                );
            }
        );

    }

    async authenticate(username: string, password: string): Promise<void> {
        const encodedCredentials = btoa(`${username}:${password}`);
        const response = await this.apiClient.post(`/users/${username}/tokens`, {
            name: "user",
            scopes: ["write:user", "write:repository"],
        }, {
            headers: { Authorization: `Basic ${encodedCredentials}` },
        });

        const token = response.data?.sha1;
        if (token) {
            this.userDataManager.saveAuthToken(token);
        } else {
            throw new APIError("Failed to retrieve authentication token.");
        }
    }

    async getUserDetails(): Promise<User> {
        const response = await this.apiClient.get("/user");
        const data = response.data;

        return new User(
            data.id,
            data.username || data.login,
            data.email,
            data.avatar_url
        );
    }

}
