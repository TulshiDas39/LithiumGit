import React, { useEffect, useMemo } from "react"
import { AppButton } from "../Buttons";

interface IProps{
    total:number;
    pageIndex:number;
    pageSize:number;    
    onPageChange:(pageIndex:number)=>void;
}
interface IState{

}
function PaginatorComponent(props:IProps){
    const totalPage = useMemo(()=>{
        return Math.ceil(props.total / props.pageSize);
    },[props.pageSize,props.total])

    const handleFirst = ()=>{
        props.onPageChange(0);
    }
    const handleLast = ()=>{        
        props.onPageChange(totalPage);
    }
    const handleNext = ()=>{
        props.onPageChange(props.pageIndex+1);
    }
    const handlePrev = ()=>{
        props.onPageChange(props.pageIndex-1);
    }

    return <div className="d-flex align-items-center">
        <AppButton text="<<-First" type="default" onClick={handleFirst} />
        <AppButton text="<-Prev" type="default" onClick={handlePrev} />
        <div className="px-2">
            <h5 style={{margin:0}}>{props.pageIndex+1}/{totalPage}</h5>
        </div>        
        <AppButton text="Next->" type="default" onClick={handleNext}/>
        <AppButton text="Last->>" type="default" onClick={handleLast}/>
    </div>
}

export const Paginator = React.memo(PaginatorComponent);