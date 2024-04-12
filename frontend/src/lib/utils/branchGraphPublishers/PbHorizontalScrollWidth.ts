import { EnumHtmlIds } from "../../enums";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";

export class PbHorizontalScrollWidth extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {        
        const elem = GraphUtils.horizontalScrollBarElement as HTMLElement;
        if(!elem)
            return ;
        elem.style.width = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        let totalWidth = RepoUtils.repositoryDetails.branchPanelWidth;
        const panelWidth = GraphUtils.state.svgContainerWidth.value;
        const zoomLabel = GraphUtils.state.zoomLabel.value;
        const effectiveWidth = totalWidth * zoomLabel;
        const width = (panelWidth * panelWidth)/ effectiveWidth;        
        return Math.min(width,panelWidth);
    }
}