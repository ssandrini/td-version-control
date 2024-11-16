import axios from "axios";
import GiteaAPI from "../GiteaAPI";
import { MissingTokenError } from "../../errors/MissingTokenError";
import { UserDataManager } from "../../managers/UserDataManager";
import {APIError} from "../../errors/APIError";

jest.mock("../../managers/UserDataManager", () => ({
    getAuthToken: jest.fn(),
    saveAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
}));

describe('GiteaAPI', () => {
    let giteaAPI: GiteaAPI;
    let mockUserDataManager: UserDataManager;
    const baseURL = 'https://gitea.example.com';

    beforeEach(() => {
        mockUserDataManager = {
            getAuthToken: jest.fn(),
            saveAuthToken: jest.fn(),
            clearAuthToken: jest.fn(),
        } as unknown as UserDataManager;

        giteaAPI = new GiteaAPI(baseURL, mockUserDataManager);

        jest.clearAllMocks();
    });

    it('should throw MissingTokenError if no token is found', async () => {
        (mockUserDataManager.getAuthToken as jest.Mock).mockReturnValueOnce(null);

        try {
            await giteaAPI.getUserDetails();
        } catch (error) {
            expect(error).toBeInstanceOf(MissingTokenError);
        }
    });

    it('should handle API error correctly', async () => {
        const mockToken = 'mockToken';
        (mockUserDataManager.getAuthToken as jest.Mock).mockReturnValueOnce(mockToken);

        const axiosGetSpy = jest.spyOn(axios, 'get').mockRejectedValueOnce({
            response: { status: 401, data: { message: 'Unauthorized' } },
        });

        try {
            await giteaAPI.getUserDetails();
        } catch (error) {
            expect(error).toBeInstanceOf(APIError);
        }

        axiosGetSpy.mockRestore();
    });
});
