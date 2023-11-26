import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbVerticalScrollHeight extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        const elem = BranchGraphUtils.verticalScrollBarElement;
        elem.style.height = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;        
        const panelHeight = BranchGraphUtils.state.panelHeight.value;
        const zoomLabel = BranchGraphUtils.state.zoomLabel2.value;
        const effectiveHeight = totalHeight * zoomLabel;
        const height = (panelHeight * panelHeight)/ effectiveHeight;
        return Math.min(height,panelHeight);
    }

}