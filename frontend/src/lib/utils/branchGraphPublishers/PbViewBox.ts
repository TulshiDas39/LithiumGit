import { IViewBox } from "../../interfaces";
import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { NumUtils } from "../NumUtils";

export class PbViewBox extends DerivedState<IViewBox>{
    constructor(value:IViewBox){
        super(value);
        BranchGraphUtils.state.viewBoxX.subscribe(this.update.bind(this));
        BranchGraphUtils.state.viewBoxY.subscribe(this.update.bind(this));
        BranchGraphUtils.state.viewBoxWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.viewBoxHeight.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",this.toString());
    }
    protected getDerivedValue(): IViewBox {
        const x = BranchGraphUtils.state.viewBoxX.value;
        const y = BranchGraphUtils.state.viewBoxY.value;
        const width = BranchGraphUtils.state.viewBoxWidth.value;
        const height = BranchGraphUtils.state.viewBoxHeight.value;
        return {x,y,width,height};
    }
    
    toString(){
        return `${BranchGraphUtils.state.viewBoxX.value} ${BranchGraphUtils.state.viewBoxY.value} ${BranchGraphUtils.state.viewBoxWidth.value} ${BranchGraphUtils.state.viewBoxHeight.value}`;
    }

    isVisible(x:number,y:number){        
        if(!NumUtils.isBetween(this.value.x, this.value.x+this.value.width, x))
            return false;
        if(!NumUtils.isBetween(this.value.y, this.value.y+this.value.height, y))
            return false;
        
        return true;
    }

}