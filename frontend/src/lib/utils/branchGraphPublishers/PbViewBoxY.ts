import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxY extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.verticalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const scrollRatio = BranchGraphUtils.state.verticalScrollRatio2.value;
        const totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const panelHeight = BranchGraphUtils.state.panelHeight.value;
        const effectivePanelHeight =  panelHeight / zoomLabel;
        const scrollableHeight = Math.max(totalHeight - effectivePanelHeight,0);
        return scrollRatio * scrollableHeight;      
    }
    protected applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",BranchGraphUtils.getViewBoxStr());
    }

}