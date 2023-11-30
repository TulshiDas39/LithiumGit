import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { BranchUtils } from "../BranchUtils";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbSelectedCommit extends UiState<ICommitInfo>{
    protected applyChange(): void {        
        this.focus();
    }

    focus(){
        const horizontalRatio = this.value.x/BranchUtils.repositoryDetails.branchPanelWidth;
        const verticalRatio = this.value.ownerBranch.y/BranchUtils.repositoryDetails.branchPanelHeight;
        BranchGraphUtils.state.horizontalScrollRatio2.publish(horizontalRatio);
        BranchGraphUtils.state.verticalScrollRatio2.publish(verticalRatio);
    }

    setHeadCommit(){
        if(this.value != BranchUtils.repositoryDetails.headCommit){
            this.publish(BranchUtils.repositoryDetails.headCommit);
        }else{
            BranchGraphUtils.state.selectedCommit.focus();
        }
    }

}