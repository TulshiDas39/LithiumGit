import { EnumHtmlIds } from "../../enums";
import { DerivedPublisher } from "../../publishers/DerivedPublisher";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbHorizontalScrollWidth extends DerivedPublisher<number>{
    onChange(): void {        
        const elem = BranchGraphUtils.svgContainer.parentElement!.
            parentElement!.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLElement;
        elem.style.width = `${this._val}px`;        
    }
    getDerivedValue(): number {
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < BranchGraphUtils.state.panelWidth.value) totalWidth = BranchGraphUtils.state.panelWidth.value;
        const panelWidth = BranchGraphUtils.state.panelWidth.value;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const effectiveWidth = totalWidth * zoomLabel;
        return (panelWidth * panelWidth)/ effectiveWidth;        
    }
}