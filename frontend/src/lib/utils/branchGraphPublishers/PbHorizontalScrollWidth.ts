import { EnumHtmlIds } from "../../enums";
import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbHorizontalScrollWidth extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.panelContainerWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {        
        const elem = BranchGraphUtils.svgContainer.parentElement!.
            parentElement!.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLElement;
        elem.style.width = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        const panelWidth = BranchGraphUtils.state.panelContainerWidth.value;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const effectiveWidth = totalWidth * zoomLabel;
        const width = (panelWidth * panelWidth)/ effectiveWidth;        
        return Math.min(width,panelWidth);
    }
}