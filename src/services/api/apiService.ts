import axios from 'axios';
import { API_ERROR_CODES } from '../../helpers/constants';

export interface ApiResponse<T> {
    statusCode: number;
    result:any
    message: string;
    data?: T; // Optional, only present on success
}

export interface ApiRequest {
    method: string;
    endpoint: string;
    data?: any; // Optional, only present on success
}

class APIService {
    private api;
    private token = sessionStorage.getItem("token");
    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL: baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                Token: this.token,
            },
        });
    }

    // Method to send requests to the API
    async send<T>(request:ApiRequest): Promise<ApiResponse<T | null>> {
        try {
            const response = await this.api.request<ApiResponse<T>>({
                method: request.method,
                url: request.endpoint,
                data: request.data,
            });
            return this.handleResponse(response.data);
        } catch (error) {
            return this.handleError<T>(error);
        }
    }

    // Handle successful responses
    private handleResponse<T>(response: ApiResponse<T>): ApiResponse<T> {
        if (response?.statusCode === API_ERROR_CODES.OK) {
            return response; // Return the successful response
        } else {
            // Handle other statuses appropriately
            return {
                statusCode: response.statusCode,
                message: response.message,
                result: response.result,
            };
        }
    }

    // Handle errors from Axios
    private handleError<T>(error: unknown): ApiResponse<T | null> {
        let errorMessage = 'API call failed';
        let statusCode: number = API_ERROR_CODES.INTERNAL_SERVER_ERROR;

        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a statusCode code
                const responseStatus = error.response.status;
                errorMessage = error.response.data?.message || 'An error occurred';

                if (responseStatus === API_ERROR_CODES.NOT_FOUND) {
                    statusCode = API_ERROR_CODES.NOT_FOUND;
                } else if (responseStatus === API_ERROR_CODES.BAD_REQUEST) {
                    statusCode = API_ERROR_CODES.BAD_REQUEST;
                } else if (responseStatus >= API_ERROR_CODES.INTERNAL_SERVER_ERROR) {
                    statusCode = API_ERROR_CODES.INTERNAL_SERVER_ERROR;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No response received from server';
            } else {
                // Something happened in setting up the request
                errorMessage = error.message;
            }
        }

        return { statusCode, message: errorMessage, result: null, data: null }; // Maintain type consistency
    }

}

export default APIService;
