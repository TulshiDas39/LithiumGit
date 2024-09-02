import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { RepoUtils } from "../RepoUtils";
import { GraphUtils } from "../GraphUtils";
import { EnumIdPrefix } from "../../enums";

export class PbSelectedCommit extends UiState<ICommitInfo|undefined>{
    protected applyChange(): void {   
        this.resetPrevious();
        this.highlight();
        if(!this.value)
            return ;
        if(!GraphUtils.state.viewBox.isVisible(this.value.x,this.value.ownerBranch.y)){
            this.focus();
        }
    }

    private resetPrevious(){
        if(!this.prevValue)
            return;
        let existingSelectedCommitElem:Element | null ;
        if(!this.prevValue.hash){
            existingSelectedCommitElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}merge`);
        }
        else {
            existingSelectedCommitElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.prevValue.hash}`);
        }
        existingSelectedCommitElem?.setAttribute("fill",GraphUtils.commitColor);
    }

    private highlight(){
        if(!this.value) return;
        var elem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.value.hash}`);        
        elem?.setAttribute("fill",GraphUtils.selectedCommitColor);        
    }

    focus(){
        if(!this.value)
            return;
        const horizontalRatio = this.value.x/RepoUtils.repositoryDetails.branchPanelWidth;
        const verticalRatio = this.value.ownerBranch.y/RepoUtils.repositoryDetails.branchPanelHeight;
        GraphUtils.state.horizontalScrollRatio.publish(horizontalRatio);
        GraphUtils.state.verticalScrollRatio.publish(verticalRatio);
    }

    setHeadCommit(){
        if(this.value != RepoUtils.repositoryDetails.headCommit){
            this.publish(RepoUtils.repositoryDetails.headCommit);
        }else{
            GraphUtils.state.selectedCommit.focus();
        }
    }

}