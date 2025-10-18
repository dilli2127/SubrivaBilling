import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { API_ERROR_CODES } from '../../helpers/constants';
import { getAuthToken, getRefreshToken, setAccessToken, setRefreshToken, clearAuthData } from '../../helpers/auth';
import { getCSRFToken } from '../../helpers/csrfToken';

export interface ApiResponse<T> {
    statusCode: number;
    result:any
    message: string;
    data?: T; // Optional, only present on success
    pagination:{};
}

export interface ApiRequest {
    method: string;
    endpoint: string;
    data?: any; // Optional, only present on success
}

class APIService {
    private api: AxiosInstance;
    private isRefreshing: boolean = false;
    private refreshSubscribers: Array<(token: string) => void> = [];
    private hasShownSessionExpiredMessage: boolean = false;

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                // Token header will be set by the interceptor
            },
        });

        // Add request interceptor for token and CSRF
        this.api.interceptors.request.use((config) => {
            const token = getAuthToken();
            if (token) {
                config.headers['Token'] = token;
                // Also add Authorization header for modern APIs
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Add CSRF token for state-changing requests
            if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
                const csrfToken = getCSRFToken();
                config.headers['X-CSRF-Token'] = csrfToken;
            }
            
            return config;
        });

        // Add response interceptor for automatic token refresh on 401
        this.api.interceptors.response.use(
            response => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
                
                if (error.response && error.response.status === 401 && !originalRequest._retry) {
                    const errorMessage = (error.response.data as any)?.exception || 
                                       (error.response.data as any)?.message || '';
                    
                    // Check if it's a permission denied error (not token expiration)
                    if (errorMessage.toLowerCase().includes('access denied') || 
                        errorMessage.toLowerCase().includes('insufficient permissions') ||
                        errorMessage.toLowerCase().includes('permission')) {
                        // Permission denied - don't clear auth, just show error with full message
                        console.warn('Permission denied:', errorMessage);
                        message.error({
                            content: 'You do not have permission to perform this action.',
                            duration: 5,
                        });
                        return Promise.reject(error);
                    }
                    
                    // Token expired - try to refresh
                    if (this.isRefreshing) {
                        // If already refreshing, queue this request
                        return new Promise((resolve) => {
                            this.refreshSubscribers.push((token: string) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers['Token'] = token;
                                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                }
                                resolve(this.api.request(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const newAccessToken = await this.refreshAccessToken();
                        
                        if (newAccessToken) {
                            // Update token in original request
                            if (originalRequest.headers) {
                                originalRequest.headers['Token'] = newAccessToken;
                                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            }
                            
                            // Process queued requests
                            this.refreshSubscribers.forEach(callback => callback(newAccessToken));
                            this.refreshSubscribers = [];
                            
                            // Retry original request
                            return this.api.request(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed - logout user
                        console.error('Token refresh failed:', refreshError);
                        
                        // Show error message only once to avoid multiple toasts
                        if (!this.hasShownSessionExpiredMessage) {
                            this.hasShownSessionExpiredMessage = true;
                            message.error('Your session has expired. Please login again.');
                        }
                        
                        clearAuthData();
                        window.location.href = '#/billing_login';
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }
                
                return Promise.reject(error);
            }
        );
    }

    // Refresh access token using refresh token
    private async refreshAccessToken(): Promise<string | null> {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
            console.warn('No refresh token available');
            return null;
        }

        try {
            const response = await axios.post(
                `${this.api.defaults.baseURL}/auth/refresh-token`,
                { refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data?.statusCode === 200) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.result;
                
                // Store new tokens
                setAccessToken(accessToken);
                if (newRefreshToken) {
                    setRefreshToken(newRefreshToken);
                }
                
                return accessToken;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            throw error;
        }
    }

    // Method to send requests to the API
    async send<T>(request:ApiRequest): Promise<ApiResponse<T | null>> {
        try {
            const { data } = await this.api.request<ApiResponse<T>>({
                method: request.method,
                url: request.endpoint,
                data: request.data,
            });
            return this.handleResponse(data);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    // Handle successful responses
    private handleResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
        // Check for 401 status code in response body (some APIs return 401 in body, not HTTP status)
        if (response.statusCode === 401) {
            // Check both exception and message fields for the error text
            const errorMessage = (response as any).exception || response.message || '';
            
            console.log('401 Response - Exception:', (response as any).exception, 'Message:', response.message);
            
            // Check if it's a permission denied error (not token expiration)
            if (errorMessage.toLowerCase().includes('access denied') || 
                errorMessage.toLowerCase().includes('insufficient permissions') ||
                errorMessage.toLowerCase().includes('permission')) {
                // Permission denied - don't clear auth, just show error with full message
                console.warn('Permission denied:', errorMessage);
                message.error({
                    content: 'You do not have permission to perform this action.',
                    duration: 5,
                });
                return response;
            }
            
            // Token expired - logout user
            console.warn('Token expired (401 in response body)');
            
            // Show error message only once to avoid multiple toasts
            if (!this.hasShownSessionExpiredMessage) {
                this.hasShownSessionExpiredMessage = true;
                message.error('Your session has expired. Please login again.');
            }
            
            clearAuthData();
            window.location.href = '#/billing_login';
            return response; // Return response but user will be redirected
        }
        
        return {
            statusCode: response.statusCode,
            message: response.message,
            result: response.result,
            pagination :response.pagination
        };
    }

    // Handle errors from Axios
    private handleError<T>(error: unknown): ApiResponse<T | null> {
        let errorMessage = 'API call failed';
        let statusCode = API_ERROR_CODES.INTERNAL_SERVER_ERROR;

        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a statusCode code
                statusCode = error.response.status;
                errorMessage = error.response.data?.message || 'An error occurred';
            } else if (error.request) {
                // Network error or timeout
                errorMessage = 'No response received from server';
                statusCode = API_ERROR_CODES.SERVICE_UNAVAILABLE ?? 503;
            } else {
                // Something happened in setting up the request
                errorMessage = error.message;
            }
        }

        return {
            statusCode,
            message: errorMessage,
            result: null,
            pagination: {}
        };
    }
}

export default APIService;
