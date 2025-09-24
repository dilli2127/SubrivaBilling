import APIService, { ApiRequest } from "./apiService";
import electronBackendService from "../electronBackend";

// Initialize API service with dynamic backend URL
let apiService: APIService | null = null;

const initializeApiService = async (): Promise<APIService> => {
  if (!apiService) {
    let baseURL: string;
    
    if (electronBackendService.isElectronApp()) {
      // Running in Electron - use external backend
      baseURL = await electronBackendService.getBackendUrl();
      console.log('🔗 Using external backend from Electron:', baseURL);
      
      // Skip health check - backend URL configured in .env
      console.log('🔗 Using configured backend URL:', baseURL);
    } else {
      // Running in browser - use environment variable or fallback
      baseURL = process.env.REACT_APP_API_URL || "http://localhost:8247/";
      console.log('🌐 Using external API:', baseURL);
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

