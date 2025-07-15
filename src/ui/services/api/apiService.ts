import axios, { type AxiosInstance } from 'axios';
import { API_ERROR_CODES } from '../../helpers/constants';

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

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                // Token header will be set by the interceptor
            },
        });

        // Add request interceptor for token
        this.api.interceptors.request.use((config) => {
            const token = sessionStorage.getItem('token');
            if (token) {
                config.headers['Token'] = token;
            }
            return config;
        });

        // Add response interceptor for token expiration
        this.api.interceptors.response.use(
            response => response,
            error => {
                if (
                    error.response &&
                    (error.response.status === 401 ||
                        error.response.data?.statusCode === 401 ||
                        error.response.data?.message?.toLowerCase().includes('token expired'))
                ) {
                    sessionStorage.clear();
                    window.location.href = '/billing_login';
                }
                return Promise.reject(error);
            }
        );
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
        // Check for 401 status code in response body
        if (response.statusCode === 401) {
            sessionStorage.clear();
            window.location.href = '/billing_login';
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
