import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";

export class PbVerticalScrollHeight extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        const elem = GraphUtils.verticalScrollBarElement;
        if(!elem)
            return;
        elem.style.height = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        let totalHeight = RepoUtils.repositoryDetails.branchPanelHeight;        
        const panelHeight = GraphUtils.state.panelHeight.value;
        const zoomLabel = GraphUtils.state.zoomLabel.value;
        const effectiveHeight = totalHeight * zoomLabel;
        const height = (panelHeight * panelHeight)/ effectiveHeight;
        return Math.min(height,panelHeight);
    }

}