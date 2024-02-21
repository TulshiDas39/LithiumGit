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
        props.onPageChange(totalPage-1);
    }
    const handleNext = ()=>{
        props.onPageChange(props.pageIndex+1);
    }
    const handlePrev = ()=>{
        props.onPageChange(props.pageIndex-1);
    }

    return <div className="d-flex align-items-center w-100 px-2">
        <div className="flex-grow-1">
            <span>Showing {props.pageIndex*props.pageSize +1} to {Math.min((props.pageIndex+1)*props.pageSize,props.total)}</span>
        </div>
        <div className="d-flex align-items-center">
            <AppButton text="<<-First" type="default" onClick={handleFirst} disabled={props.pageIndex === 0} />
            <AppButton text="<-Prev" type="default" onClick={handlePrev} disabled={props.pageIndex === 0} />
            <div className="px-2">
                <h5 style={{margin:0}}> Page {props.pageIndex+1}/{totalPage}</h5>
            </div>        
            <AppButton text="Next->" type="default" onClick={handleNext} disabled={props.pageIndex === totalPage-1}/>
            <AppButton text="Last->>" type="default" onClick={handleLast} disabled={props.pageIndex === totalPage-1}/>
        </div>
        
    </div>
}

export const Paginator = React.memo(PaginatorComponent);