import { BaseSchema } from "./BaseSchema";
export declare class RepositoryInfo extends BaseSchema {
    name: string;
    path: string;
    isSelected: boolean;
    constructor(path: string, name: string, isSelected?: boolean);
}
