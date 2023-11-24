import { ICommitInfo } from "common_library";
import { Publisher } from "../../publishers";

export class PbMergeCommit extends Publisher<ICommitInfo>{
    onChange(): void {
        //throw new Error("Method not implemented.");
    }

}