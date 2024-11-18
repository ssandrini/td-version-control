import {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import log from "electron-log/main.js";
import userDataManager from "../managers/UserDataManager";
import MissingAuthenticationToken from "../errors/MissingAuthenticationToken";
import {AuthToken} from "../models/api/AuthToken";

export const successResponseInterceptor = (response: AxiosResponse) => {
    log.debug(`Response from: ${response.config.url}`);
    log.debug(`Response status: ${response.status}`);
    log.debug(`Response data: ${JSON.stringify(response.data)}`);
    return response;
};

export const errorResponseInterceptor = (error: any) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        log.error(`Response from: ${error.response.config.url}`);
        log.error(`Response status: ${error.response.status}`);
        log.error(`Response body: ${JSON.stringify(error.response.data)}`);
        return Promise.reject(error);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        log.error("No response was received:", error.request);
        return Promise.reject(error);
    }

    // Something happened in setting up the request that triggered an Error
    log.error('General error: ', error.message);
    return Promise.reject(error);
};

export const addAuthenticationTokenInterceptor = (config: InternalAxiosRequestConfig) => {
    log.debug(`Request to: ${config.url}`);
    log.debug(`Request body: ${JSON.stringify(config.data)}`);
    log.debug(`Request headers: ${JSON.stringify(config.headers)}`);

    if (config.url && config.url.includes("/tokens") && config.method!.toLowerCase() === "post") {
        log.debug("Skipping auth token for authentication request.");
        return config;
    }

    const token : AuthToken|null = userDataManager.getAuthToken();
    if (!token) {
        log.error("Missing authentication token");
        return Promise.reject(MissingAuthenticationToken);
    }
    log.debug("Adding Authorization header with token:", token);
    config.headers.Authorization = `token ${token.sha1}`;
    return config;
};