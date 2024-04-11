import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { GraphUtils } from "../BranchGraphUtils";

export class PbHeadCommit extends UiState<ICommitInfo>{
    protected applyChange(): void {
        GraphUtils.updateHeadIdentifier();
    }

}