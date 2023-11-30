import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { BranchUtils } from "../BranchUtils";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { EnumIdPrefix } from "../../enums";

export class PbSelectedCommit extends UiState<ICommitInfo>{
    protected applyChange(): void {   
        this.resetPrevious();
        this.highlight();
        if(!BranchGraphUtils.state.viewBox2.isVisible(this.value.x,this.value.ownerBranch.y)){
            this.focus();
        }
    }

    private resetPrevious(){
        if(!this.prevValue)
            return;
        let existingSelectedCommitElem:Element | null ;
        if(!this.prevValue.hash){
            existingSelectedCommitElem = BranchGraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}merge`);
        }
        else {
            existingSelectedCommitElem = BranchGraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.prevValue.hash}`);
        }
        existingSelectedCommitElem?.setAttribute("fill",BranchGraphUtils.commitColor);
    }

    private highlight(){
        var elem = BranchGraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.value.hash}`);        
        elem?.setAttribute("fill",BranchGraphUtils.selectedCommitColor);        
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