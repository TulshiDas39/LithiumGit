import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxX extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.horizontalScrollRatio.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
        BranchGraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {        
        const scrollRatio = BranchGraphUtils.state.horizontalScrollRatio.value;
        const totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        const zoomLabel = BranchGraphUtils.state.zoomLabel.value;
        const panelWidth = BranchGraphUtils.state.svgContainerWidth.value-BranchGraphUtils.scrollBarSize;
        const effectivePanelWidth =  panelWidth / zoomLabel;
        const scrollableWidth = Math.max(totalWidth - effectivePanelWidth,0);
        return scrollRatio * scrollableWidth;
    }
    protected applyChange(): void {
        
    }

}