import React from "react";
import { ContextData, IBaseProps } from "./ContextData"

interface IProps extends IBaseProps{
    onClick:()=>void;
}

function ShowMoreComponent(props:IProps){
    return <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}
    onClick={_=> props.onClick()}>
    <div className="col-12 hover cur-default ">Show More</div>
</div>
}

export const ShowMore = React.memo(ShowMoreComponent);