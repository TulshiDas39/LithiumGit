import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";

export class PbPanelHeight extends DerivedState<number>{    
    protected getDerivedValue(): number {
        const elem = GraphUtils.svgContainer;
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().height;
    }

    protected applyChange(): void {
        GraphUtils.svgElement?.setAttribute("height",this.value+"");
    }

}