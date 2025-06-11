import APIService, { ApiRequest } from "./apiService";

const apiService = new APIService("http://localhost:8247/");
// const apiService = new APIService('https://api.freshfocuzstudio.com/');

const requestBackServer = async (request: ApiRequest) => {
  return await apiService.send<any>(request);
};

export default requestBackServer;

