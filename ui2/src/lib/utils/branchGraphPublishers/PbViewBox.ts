import { IViewBox } from "../../interfaces";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { NumUtils } from "../NumUtils";

export class PbViewBox extends DerivedState<IViewBox>{
    constructor(value:IViewBox){
        super(value);
        GraphUtils.state.viewBoxX.subscribe(this.update.bind(this));
        GraphUtils.state.viewBoxY.subscribe(this.update.bind(this));
        GraphUtils.state.viewBoxWidth.subscribe(this.update.bind(this));
        GraphUtils.state.viewBoxHeight.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        const svgElem = GraphUtils.svgElement;
        svgElem.setAttribute("viewBox",this.toString());
    }
    protected getDerivedValue(): IViewBox {
        const x = GraphUtils.state.viewBoxX.value;
        const y = GraphUtils.state.viewBoxY.value;
        const width = GraphUtils.state.viewBoxWidth.value;
        const height = GraphUtils.state.viewBoxHeight.value;
        return {x,y,width,height};
    }
    
    toString(){
        return `${GraphUtils.state.viewBoxX.value} ${GraphUtils.state.viewBoxY.value} ${GraphUtils.state.viewBoxWidth.value} ${GraphUtils.state.viewBoxHeight.value}`;
    }

    isVisible(x:number,y:number){        
        if(!NumUtils.isBetween(this.value.x, this.value.x+this.value.width, x))
            return false;
        if(!NumUtils.isBetween(this.value.y, this.value.y+this.value.height, y))
            return false;
        
        return true;
    }

}