import log from "electron-log/main";
import giteaAPIConnector from "./GiteaAPIConnector";
import { HttpMethod } from "../types/HttpMethod";
import { ApiResponse } from "../errors/ApiResponse";
import Project from "../models/Project";

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
            const remote_projects = response.result.map(repo => ({
                name: repo.name,
                author: repo.owner.username,
                clone_url: repo.clone_url
            }));

            log.debug("Projects fetched successfully:", remote_projects);

            const projects: Project[] = remote_projects.map((p) => ({
                name: p.name,
                author: p.author,
                remote: p.clone_url,
            }));

            return ApiResponse.fromResult(projects);
        } else {
            log.error("Error fetching projects due to", response.errorCode);
            return ApiResponse.fromErrorCode(response.errorCode!);
        }
    }
}

export default new RemoteRepoService();
