import log from "electron-log/main.js";
import giteaAPIConnector from "./GiteaAPIConnector";
import { HttpMethod } from "../types/HttpMethod";
import { ApiResponse } from "../errors/ApiResponse";
import Project from "../models/Project";
import {User} from "../models/api/User";

export class RemoteRepoService {
    async createRepository(name: string): Promise<ApiResponse<string>> {
        log.debug("Creating repository with name:", name);

        const requestData = {
            auto_init: false,
            default_branch: "master",
            name,
            object_format_name: "sha1",
            private: false,
            template: false,
            trust_model: "default",
        };

        const response = await giteaAPIConnector.apiRequest<{ clone_url: string }>(
            '/user/repos',
            HttpMethod.POST,
            requestData,
        );

        if (response.result) {
            log.debug("Repository created successfully:", response.result);
            return Promise.resolve(ApiResponse.fromResult(response.result.clone_url!));
        } else {
            log.error("Error creating repository due to", response.errorCode);
            return Promise.resolve(ApiResponse.fromErrorCode(response.errorCode!));
        }
    }

    async getProjects(): Promise<ApiResponse<Project[]>> {
        log.debug("Fetching projects...");

        const response = await giteaAPIConnector.apiRequest<{ name: string; owner: {username: string; }; clone_url: string }[]>(
            '/user/repos',
            HttpMethod.GET,
        );

        if (response.result) {
            const remote_projects: Project[] = response.result.map(repo => ({
                name: repo.name,
                owner: repo.owner.username,
                remote: repo.clone_url
            }));

            log.debug("Projects fetched successfully:", remote_projects);
            return ApiResponse.fromResult(remote_projects);
        } else {
            log.error("Error fetching projects due to", response.errorCode);
            return ApiResponse.fromErrorCode(response.errorCode!);
        }
    }

    async addCollaborator(
        repoOwner: string,
        repoName: string,
        collaborator: string,
        permissions: "read" | "write" | "admin"
    ): Promise<ApiResponse> {
        log.debug(`Adding collaborator: ${collaborator} to repository: ${repoOwner}/${repoName} with permissions: ${permissions}`);

        const requestData = {
            permissions,
        };

        const endpoint = `/repos/${repoOwner}/${repoName}/collaborators/${collaborator}`;
        const response = await giteaAPIConnector.apiRequest<void>(
            endpoint,
            HttpMethod.PUT,
            requestData,
        );

        if (!response.errorCode) {
            log.debug(`Collaborator ${collaborator} added successfully to ${repoOwner}/${repoName}`);
            return ApiResponse.fromResult();
        } else {
            log.error("Error adding collaborator due to", response.errorCode);
            return ApiResponse.fromErrorCode(response.errorCode!);
        }
    }

    async getCollaborators(
        repoOwner: string,
        repoName: string
    ): Promise<ApiResponse<User[]>> {
        log.debug(`Fetching collaborators for repository: ${repoOwner}/${repoName}`);

        const endpoint = `/repos/${repoOwner}/${repoName}/collaborators`;
        const response = await giteaAPIConnector.apiRequest<User[]>(
            endpoint,
            HttpMethod.GET
        );

        if (response.result) {
            log.debug(`Collaborators fetched successfully for ${repoOwner}/${repoName}:`, response.result);
            return ApiResponse.fromResult(response.result);
        } else {
            log.error("Error fetching collaborators due to", response.errorCode);
            return ApiResponse.fromErrorCode(response.errorCode!);
        }
    }

    async removeCollaborator(
        repoOwner: string,
        repoName: string,
        username: string
    ): Promise<ApiResponse> {
        log.debug(`Removing collaborator: ${username} from repository: ${repoOwner}/${repoName}`);

        const endpoint = `/repos/${repoOwner}/${repoName}/collaborators/${username}`;
        const response = await giteaAPIConnector.apiRequest<void>(
            endpoint,
            HttpMethod.DELETE
        );

        if (!response.errorCode) {
            log.debug(`Collaborator ${username} removed successfully from ${repoOwner}/${repoName}`);
            return ApiResponse.fromResult();
        } else {
            log.error("Error removing collaborator due to", response.errorCode);
            return ApiResponse.fromErrorCode(response.errorCode!);
        }
    }

}

export default new RemoteRepoService();
