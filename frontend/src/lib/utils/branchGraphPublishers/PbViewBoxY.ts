import { DerivedState } from "../../publishers";
import { GraphUtils } from "../BranchGraphUtils";
import { RepoUtils } from "../BranchUtils";

export class PbViewBoxY extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.verticalScrollRatio.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
        GraphUtils.state.panelHeight.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const scrollRatio = GraphUtils.state.verticalScrollRatio.value;
        const totalHeight = RepoUtils.repositoryDetails.branchPanelHeight;
        const zoomLabel = GraphUtils.state.zoomLabel.value;
        const panelHeight = GraphUtils.state.panelHeight.value;
        const effectivePanelHeight =  panelHeight / zoomLabel;
        const scrollableHeight = Math.max(totalHeight - effectivePanelHeight,0);
        return scrollRatio * scrollableHeight;      
    }
    protected applyChange(): void {
        
    }

}