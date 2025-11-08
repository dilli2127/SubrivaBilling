import APIService, { ApiRequest } from "./apiService";
import electronBackendService from "../electronBackend";
import { getActiveApiUrl } from "../../helpers/apiModeHelper";

// Initialize API service with dynamic backend URL
let apiService: APIService | null = null;

const initializeApiService = async (): Promise<APIService> => {
  if (!apiService) {
    let baseURL: string;
    
    if (electronBackendService.isElectronApp()) {
      // Running in Electron - use external backend
      baseURL = await electronBackendService.getBackendUrl();
      
      // Skip health check - backend URL configured in .env
    } else {
      // Running in browser - use API mode configuration
      baseURL = getActiveApiUrl();
    }
    
    apiService = new APIService(baseURL);
  }
  
  return apiService;
};

const requestBackServer = async (request: ApiRequest) => {
  const service = await initializeApiService();
  return await service.send<any>(request);
};

export default requestBackServer;

// Export for direct access if needed
export { initializeApiService };

