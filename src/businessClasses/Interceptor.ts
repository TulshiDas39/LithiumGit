import { IAxiosErrorModel, IRequestFailedModel, IResponseModel } from "../types";
import Axios, { AxiosRequestConfig } from "axios";

export class Intercept{

    private static getAuthorizedRequestConfig = () => {
        let token = "";
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
    }

    private static handleHttpFailed(error?: IAxiosErrorModel) {
        let errorData:IRequestFailedModel={
            error:error,
            message:error?.data.message ||  "Request Failed",
            statusCode:error?.status
        }       
        
        return errorData;
    }

    static get<T=any>(url:string,config?:AxiosRequestConfig):Promise<IResponseModel<T>>{
        config = config || Intercept.getAuthorizedRequestConfig();
        return Axios.get<T>(url, config).then(response => ({ response }))
            .catch(err => ({ error: Intercept.handleHttpFailed(err.response)}));
    }

    static post<T=any>(url:string,data:any,config?:AxiosRequestConfig):Promise<IResponseModel<T>>{
        config = config || Intercept.getAuthorizedRequestConfig();
        return Axios.post<T>(url, data,config).then(response => ({ response }))
            .catch(err=>({error:Intercept.handleHttpFailed(err.response) }));
    }

    static put<T=any>(url:string,data:any,config?:AxiosRequestConfig):Promise<IResponseModel<T>>{
        config = config || Intercept.getAuthorizedRequestConfig();
        return Axios.put<T>(url, data,config).then(response => ({ response }))
            .catch(err => ({ error: Intercept.handleHttpFailed(err.response) }));
    }

    static delete<T=any>(url:string,config?:AxiosRequestConfig):Promise<IResponseModel<T>>{
        config = config || Intercept.getAuthorizedRequestConfig();
        return Axios.delete<T>(url, config).then(response => ({ response }))
            .catch(err => ({ error: Intercept.handleHttpFailed(err.response) }));
    }
}