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
        const panelWidth = BranchGraphUtils.state.panelWidth.value-BranchGraphUtils.scrollBarSize;
        const effectivePanelWidth =  panelWidth / zoomLabel;
        const scrollableWidth = Math.max(totalWidth - effectivePanelWidth,0);
        return scrollRatio * scrollableWidth;
    }
    protected applyChange(): void {
        
    }

}