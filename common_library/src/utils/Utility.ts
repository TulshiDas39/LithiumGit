import { IChanges } from "../models";

export class Utility{
    static countChangedItem(changes:IChanges){
        let count = 0;
        if(!changes)
            return count;
        if(changes.created)
            count += changes.created.length;
        if(changes.deleted)
            count += changes.deleted.length;
        if(changes.modified)
            count += changes.modified.length;

        return count;
    }
}