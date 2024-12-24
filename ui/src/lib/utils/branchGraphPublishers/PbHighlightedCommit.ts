import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { EnumIdPrefix } from "../../enums";

export class PbHighlightedCommit extends UiState<ICommitInfo|undefined>{
    private readonly cssClass = "commit_hightlighted";
    protected applyChange(): void {
        //throw new Error("Method not implemented.");
        this.resetUi();
        this.hightlight();

    }
    private hightlight(){
        if(!this.value)
            return ;
        const commit = GraphUtils.svgElement?.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.value.hash}`);
        if(!commit)
            return;
        commit.classList.add(this.cssClass);
        GraphUtils.scrollToCommit(this.value);
    }

    private resetUi(){
        const commit = GraphUtils.svgElement?.querySelector(`.${this.cssClass}`);
        if(!commit)
            return;
        commit.classList.remove(this.cssClass);
    }

}