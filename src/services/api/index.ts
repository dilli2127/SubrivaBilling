import APIService, { ApiRequest } from "./apiService";
import electronBackendService from "../electronBackend";

// Initialize API service with dynamic backend URL
let apiService: APIService | null = null;

const initializeApiService = async (): Promise<APIService> => {
  if (!apiService) {
    let baseURL: string;
    
    if (electronBackendService.isElectronApp()) {
      // Running in Electron - check if it's frontend-only or full-stack
      baseURL = await electronBackendService.getBackendUrl();
      
      if (baseURL && baseURL !== 'http://localhost:8247') {
        // Frontend-only mode - using external backend
        console.log('🔗 Using external backend (frontend-only mode):', baseURL);
      } else {
        // Full-stack mode - using embedded backend
        console.log('🔗 Using Electron embedded backend:', baseURL);
        
        // Wait for backend to be ready
        const isReady = await electronBackendService.waitForBackend();
        if (!isReady) {
          console.warn('⚠️ Backend may not be ready, but continuing...');
        }
      }
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

