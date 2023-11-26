import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxX extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.horizontalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.viewBoxWidth.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const scrollRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        const totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        const viewBoxWidth = BranchGraphUtils.state.viewBoxWidth.value;
        const x = (totalWidth * scrollRatio) - (viewBoxWidth/2);
        return x;
    }
    applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",BranchGraphUtils.getViewBoxStr());
    }

}