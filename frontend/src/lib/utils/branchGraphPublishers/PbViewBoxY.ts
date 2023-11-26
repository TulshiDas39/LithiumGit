import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxY extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.verticalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        BranchGraphUtils.state.viewBoxHeight.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const scrollRatio = BranchGraphUtils.state.verticalScrollRatio2.value;
        const totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        const viewBoxHeight = BranchGraphUtils.state.viewBoxHeight.value;
        const y = (totalHeight * scrollRatio) - (viewBoxHeight/2);
        return y;
    }
    protected applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",BranchGraphUtils.getViewBoxStr());
    }

}