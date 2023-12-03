import { EnumHtmlIds } from "../../enums";
import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbBranchPanelWidth extends DerivedState<number>{    
    protected getDerivedValue() {
        const elem = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`);
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().width;
    }

    protected applyChange(): void {
        BranchGraphUtils.svgElement.setAttribute("width",this.value+"");
    }
}