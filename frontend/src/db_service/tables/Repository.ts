import { DATA_TYPE, ITable } from "jsstore";
import { BaseFields } from "./BaseFields";

export class Repository extends BaseFields{
    name:string="";
    path:string="";
    isSelected = false;
}

export const tblRepository:ITable = {
    name: 'Repository',
    columns: {        
        id:{ primaryKey: true, autoIncrement: true },
        name:  { notNull: true, dataType: "string" },
        path:  { notNull: true, dataType: "string" },
        isSelected: {notNull: true, dataType:DATA_TYPE.Boolean}
        // price:  { notNull: true, dataType: "number" },
        // quantity : { notNull: true, dataType: "number" }
    }
};