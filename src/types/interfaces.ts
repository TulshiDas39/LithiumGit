import { AxiosResponse } from "axios";
import { EnumArchType, EnumFileType } from "./enums";

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

export interface ILatestVersion{
    version:string;
    files:IReleaseFile[];
}

export interface IReleaseFile{
    type:EnumFileType;
    url:string;
    arch:EnumArchType;
}