import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbHeadCommit extends UiState<ICommitInfo>{
    protected applyChange(): void {
        BranchGraphUtils.updateHeadIdentifier();
    }

}