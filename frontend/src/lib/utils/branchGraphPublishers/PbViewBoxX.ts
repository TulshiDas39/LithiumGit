import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";

export class PbViewBoxX extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.horizontalScrollRatio.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
        GraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {        
        const scrollRatio = GraphUtils.state.horizontalScrollRatio.value;
        const totalWidth = RepoUtils.repositoryDetails.branchPanelWidth;
        const zoomLabel = GraphUtils.state.zoomLabel.value;
        const panelWidth = GraphUtils.state.svgContainerWidth.value-GraphUtils.scrollBarSize;
        const effectivePanelWidth =  panelWidth / zoomLabel;
        const scrollableWidth = Math.max(totalWidth - effectivePanelWidth,0);
        return scrollRatio * scrollableWidth;
    }
    protected applyChange(): void {
        
    }

}