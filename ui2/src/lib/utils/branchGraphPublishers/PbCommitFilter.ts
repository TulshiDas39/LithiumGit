import { ICommitFilter } from "common_library";
import { UiState } from "../../publishers";
import { ReduxUtils } from "../ReduxUtils";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";


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

    reset(){
        const filter = {...GraphUtils.state.filter.value};        
        const head = RepoUtils.repositoryDetails.status.headCommit;
        if(!head)
            return;
        filter.fromDate = undefined;
        filter.toDate = undefined;
        filter.baseDate = new Date(head.date).toISOString();
        filter.limit = GraphUtils.defaultLimit;
        filter.userModified = false;
        GraphUtils.state.filter.publishFilter(filter);
    }
}