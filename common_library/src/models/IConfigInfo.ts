import { BaseSchema } from "../schemas";

export interface IConfigInfo extends BaseSchema {
    portNumber: number;
    autoStage:boolean;    
}