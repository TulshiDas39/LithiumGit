import { DerivedPublisher } from "../../publishers/DerivedPublisher";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class HorizontalScrollWidth extends DerivedPublisher<number>{
    getDerivedValue(): number {
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < BranchGraphUtils.state.panelWidth.value) totalWidth = BranchGraphUtils.state.panelWidth.value;
        const panelWidth = BranchGraphUtils.state.panelWidth.value;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const effectiveWidth = totalWidth * zoomLabel;
        console.log("hscrol width",panelWidth / effectiveWidth);
        return panelWidth / effectiveWidth;        
    }
}