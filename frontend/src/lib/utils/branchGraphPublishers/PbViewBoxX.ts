import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxX extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.horizontalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelWidth.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {        
        const scrollRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        const totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const panelWidth = BranchGraphUtils.state.panelWidth.value;
        const effectiveWidth = Math.max( totalWidth * zoomLabel,panelWidth);
        const scrollableWidth = effectiveWidth - panelWidth;
        return scrollRatio * scrollableWidth;
    }
    applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",BranchGraphUtils.getViewBoxStr());
    }

}