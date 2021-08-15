import { BaseSchema } from "./BaseSchema";
export interface RepositoryInfo extends BaseSchema {
    name: string;
    path: string;
    isSelected: boolean;
}
export declare const createRepositoryInfo: (props?: Partial<RepositoryInfo>) => RepositoryInfo;
