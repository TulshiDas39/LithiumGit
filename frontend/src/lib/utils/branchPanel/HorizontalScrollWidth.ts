import { DerivedPublisher } from "../../publishers/DerivedPublisher";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class HorizontalScrollWidth extends DerivedPublisher<number>{
    getDerivedValue(): number {
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < BranchGraphUtils.state.panelWidth.value) totalWidth = BranchGraphUtils.state.panelWidth.value;
        const widthRatio = BranchGraphUtils.state.viewBox.width / totalWidth;
        const horizontalScrollWidth = widthRatio*BranchGraphUtils.state.panelWidth.value;
        return horizontalScrollWidth;
    }
}