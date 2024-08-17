import { ICommitFilter } from "common_library";
import { UiState } from "../../publishers";
import { ReduxUtils } from "../ReduxUtils";


export class PbCommitFilter extends UiState<ICommitFilter>{
    constructor(filter:ICommitFilter){
        super(filter);
    }

    protected applyChange(): void {
        ReduxUtils.refreshGraph();
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