export interface BaseSchema {
    _id: string;
    createdAt: string;
    updateAt: string;
}
export declare function createBaseSchema(props?: Partial<BaseSchema>): BaseSchema;
