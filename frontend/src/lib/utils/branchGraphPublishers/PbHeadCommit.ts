import { ICommitInfo } from "common_library";
import { UiState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";

export class PbHeadCommit extends UiState<ICommitInfo>{
    protected applyChange(): void {
        GraphUtils.updateHeadIdentifier();
    }

}