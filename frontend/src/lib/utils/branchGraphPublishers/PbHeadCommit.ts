import { ICommitInfo } from "common_library";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";
import { EnumIdPrefix } from "../../enums";

export class PbHeadCommit extends DerivedState<ICommitInfo|undefined>{
    protected getDerivedValue(): ICommitInfo | undefined {
        return RepoUtils.repositoryDetails?.allCommits.find(_=>_.isHead);
    }
    protected applyChange(): void {
        if(this.value){
            const headElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${this.value.hash}`)
            headElem?.classList.remove("d-none");
        }        
        if(!this.prevValue)
            return;
        const prevHeadElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${GraphUtils.state.headCommit.prevValue!.hash}`);
        prevHeadElem?.classList.add("d-none");
    }

}