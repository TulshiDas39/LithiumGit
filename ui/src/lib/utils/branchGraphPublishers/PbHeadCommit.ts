import { IHeadCommitInfo } from "common_library";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";
import { EnumIdPrefix } from "../../enums";

export class PbHeadCommit extends DerivedState<IHeadCommitInfo|undefined>{
    protected getDerivedValue(): IHeadCommitInfo | undefined {  
        const head = RepoUtils.repositoryDetails?.allCommits.find(_=>_.isHead) as IHeadCommitInfo;
        return head;
    }
    protected applyChange(): void {
        if(!GraphUtils.svgElement) return;
        this.revertUiOfExistingCheckout();
        this.updateUiForNewHead();
        if(this.value){
            const headElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${this.value.hash}`)
            headElem?.classList.remove("d-none");
        }
    }

    private revertUiOfExistingCheckout(){
        const headCommit = this._prevVal;
        if(!headCommit)
            return;
        const headCommitTextElem = GraphUtils.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);
        if(headCommitTextElem) {
            headCommitTextElem.classList.add("d-none");
        }
        if(headCommit.isDetached){
            this.resetRefs(headCommit);
        }

    }

    private updateUiForNewHead(){
        const headCommit = this.value;
        if(!headCommit)
            return;

        const HTextElem = GraphUtils.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);

        HTextElem?.classList.remove("d-none");
        if(headCommit.isDetached)
            this.resetRefs(headCommit);        
    }

    private resetRefs(commit:IHeadCommitInfo){
        const refElems = GraphUtils.svgElement.querySelectorAll(`.${EnumIdPrefix.COMMIT_REF}${commit.hash}`);
        for(let i = 0;i<refElems.length;i++){
            refElems.item(i).remove();
        }       
        for(let i = 0;i<commit.refValues.length;i++){
            const ref = commit.refValues[i];
            const headTextElem = GraphUtils.CreateHeadTextElement(commit,ref,i);
            const commitElem = GraphUtils.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${commit.hash}`);
            commitElem?.insertAdjacentElement("beforebegin",headTextElem!);
        }

    }

}