import { AxiosResponse } from "axios";

export interface IResponseModel<T>{
    response?:AxiosResponse<T>;
    error?:IRequestFailedModel;
}

export interface IRequestFailedModel{
    statusCode?: number;
    error?: any;
    message: string;
}

export type IAxiosErrorModel = AxiosResponse<IRequestFailedModel> | undefined;