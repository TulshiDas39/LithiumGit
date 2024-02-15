import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbPanelHeight extends DerivedState<number>{    
    protected getDerivedValue(): number {
        const elem = BranchGraphUtils.svgContainer;
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().height;
    }

    protected applyChange(): void {
        BranchGraphUtils.svgElement?.setAttribute("height",this.value+"");
    }

}