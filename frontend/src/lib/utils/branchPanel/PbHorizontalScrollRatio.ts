import { Publisher } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbHorizontalScrollRatio extends Publisher<number>{
    onChange(): void {
        BranchGraphUtils.state.horizontalScrollLeft2.update();
    }

}