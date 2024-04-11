import { EnumHtmlIds } from "../../enums";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../BranchGraphUtils";

export class PbSvgContainerWidth extends DerivedState<number>{    
    protected getDerivedValue() {
        const elem = document.querySelector(`#${EnumHtmlIds.branchSvgContainer}`);
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().width;
    }

    protected applyChange(): void {
        GraphUtils.svgElement?.setAttribute("width",this.value+"");
    }
}