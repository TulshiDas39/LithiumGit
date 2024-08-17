import { ICommitFilter } from "common_library";
import { UiState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";


export class PbCommitFilter extends UiState<ICommitFilter>{
    constructor(filter:ICommitFilter){
        super(filter);
    }

    protected applyChange(): void {
        throw new Error("Method not implemented.");
    }

    publishFilter(filter:Partial<ICommitFilter>){
        this.publish({...this.value,...filter});
    }

    resetFilter(){
        const filter = {...this.value};
        if(!filter.userModified){
            filter.toDate = new Date().toISOString();
        }

        this.publishFilter(filter);
    }
}