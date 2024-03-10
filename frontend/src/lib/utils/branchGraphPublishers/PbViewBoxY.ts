import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbViewBoxY extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.verticalScrollRatio.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const scrollRatio = BranchGraphUtils.state.verticalScrollRatio.value;
        const totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        const zoomLabel = BranchGraphUtils.state.zoomLabel.value;
        const panelHeight = BranchGraphUtils.state.panelHeight.value;
        const effectivePanelHeight =  panelHeight / zoomLabel;
        const scrollableHeight = Math.max(totalHeight - effectivePanelHeight,0);
        if(Number.isNaN(scrollRatio * scrollableHeight)){
            debugger;
        }
        return scrollRatio * scrollableHeight;      
    }
    protected applyChange(): void {
        
    }

}