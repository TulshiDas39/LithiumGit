import { EnumHtmlIds } from "../../enums";
import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbHorizontalScrollWidth extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.panelWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {        
        const elem = BranchGraphUtils.svgContainer.parentElement!.
            parentElement!.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLElement;
        elem.style.width = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < BranchGraphUtils.state.panelWidth.value) totalWidth = BranchGraphUtils.state.panelWidth.value;
        const panelWidth = BranchGraphUtils.state.panelWidth.value;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const effectiveWidth = totalWidth * zoomLabel;
        return (panelWidth * panelWidth)/ effectiveWidth;        
    }
}