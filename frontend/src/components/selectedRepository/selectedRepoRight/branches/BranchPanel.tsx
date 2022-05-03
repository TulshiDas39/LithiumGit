import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { useMemo, useRef } from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { useMultiState } from "../../../../lib";
import { useDrag } from "../../../../lib/hooks/useDrag";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails:IRepositoryDetails;
}

interface IState{
    scrollTop:number;
    scrollLeft:number;
    horizontalScrollPercent:number;
    verticalScrollPercent:number;
    viewBox:{x:number;y:number;width:number;height:number};
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const panelWidth = 865;
    const horizontalScrollContainerWidth = panelWidth+10;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);

    useEffect(()=>{
        //setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        horizontalScrollPercent:0,
        verticalScrollPercent:0,
        viewBox:{x:props.repoDetails.branchPanelWidth - panelWidth,y:-10,width:panelWidth,height:panelHeight},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
    });

    const dataRef = useRef({
        initialHorizontalScrollPercent:0,
        initialVerticalScrollPercent:0,
    });

    const isMounted = useRef(false);
    useEffect(()=>{
        isMounted.current = true;
    },[])
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        else return;
        let totalWidth = props.repoDetails.branchPanelWidth;
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        if(totalWidth < panelWidth) totalHeight = panelWidth;
        const horizontalPercent = (props.repoDetails?.headCommit.x*100)/totalWidth;
        const verticalPercent = (props.repoDetails?.headCommit.ownerBranch.y*100)/totalHeight;
        dataRef.current.initialHorizontalScrollPercent = horizontalPercent;
        dataRef.current.initialVerticalScrollPercent = verticalPercent;
        setState({
            horizontalScrollPercent:horizontalPercent,
            verticalScrollPercent:verticalPercent,
        });

    },[props.repoDetails?.headCommit])        
    
    const horizontalScrollWidth = useMemo(()=>{
        const width = state.viewBox.width / props.repoDetails.branchPanelWidth;
        return width*panelWidth;
    },[state.viewBox.width,props.repoDetails.branchPanelWidth]);

    const verticalScrollHeight = useMemo(()=>{        
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        const height = state.viewBox.height / totalHeight;        
        return height*panelHeight;
    },[state.viewBox.height,props.repoDetails.branchPanelHeight]);

    const {currentMousePosition: horizontalScrollMousePosition,elementRef: horizontalScrollElementRef} = useDrag();
    const {currentMousePosition:verticalScrollMousePosition,elementRef:verticalScrollElementRef} = useDrag();
    useEffect(()=>{
        if(horizontalScrollMousePosition === undefined ) {
            if(!state.notScrolledHorizontallyYet){                
                dataRef.current.initialHorizontalScrollPercent = state.horizontalScrollPercent;
            }
        }
        else{
            let initialX = (dataRef.current.initialHorizontalScrollPercent/100)*panelWidth;
            const newX = initialX+ horizontalScrollMousePosition!.x;
            let newPercent = (newX *100)/panelWidth;
            const minPercent = (horizontalScrollWidth*100)/ horizontalScrollContainerWidth;
            if(newPercent > 100) newPercent = 100;            
            else if(newPercent < minPercent) newPercent = minPercent;
            setState({
                horizontalScrollPercent: newPercent,
                notScrolledHorizontallyYet:false,
            })
        }        
    },[horizontalScrollMousePosition])        

    useEffect(()=>{
        if(verticalScrollMousePosition === undefined ) {
            if(!state.notScrolledVerticallyYet){                
                dataRef.current.initialVerticalScrollPercent = state.verticalScrollPercent;
            }
        }
        else{
            let initialY = (dataRef.current.initialVerticalScrollPercent/100)*panelHeight;
            const newY = initialY+ verticalScrollMousePosition!.y;
            let newPercent = (newY *100)/panelHeight;
            const minPercent = (verticalScrollHeight*100)/ panelHeight;
            if(newPercent > 100) newPercent = 100;            
            else if(newPercent < minPercent) newPercent = minPercent;
            setState({
                verticalScrollPercent: newPercent,
                notScrolledVerticallyYet:false,
            })
        }        
    },[verticalScrollMousePosition])
    
    useEffect(()=>{
        const x = props.repoDetails.branchPanelWidth *(state.horizontalScrollPercent/100);
        let viewBoxX = x - panelWidth+horizontalScrollWidth;

        if(state.horizontalScrollPercent < 50){
            viewBoxX = x - panelWidth-horizontalScrollWidth;
        }
        if(viewBoxX < 0) viewBoxX = 0;
        setState(st=>({
            ...st,
            viewBox:{
                ...st.viewBox,
                x: viewBoxX
            }
        }))
    },[state.horizontalScrollPercent]);

    useEffect(()=>{
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;

        const y = totalHeight *(state.verticalScrollPercent/100);
        let viewBoxY = y - panelHeight+verticalScrollHeight;

        if(state.verticalScrollPercent < 50){
            viewBoxY = y - panelHeight-verticalScrollHeight;
        }
        if(viewBoxY < 0) viewBoxY = 0;
        setState(st=>({
            ...st,
            viewBox:{
                ...st.viewBox,
                y: viewBoxY
            }
        }))
    },[state.verticalScrollPercent]);

    const adjustedHorizontalRight = useMemo(()=>{
        let x = horizontalScrollContainerWidth * (1-(state.horizontalScrollPercent/100));        
        if( x < 0) return 0;
        if(x > horizontalScrollContainerWidth - horizontalScrollWidth) 
            return horizontalScrollContainerWidth - horizontalScrollWidth;
        return x;        
    },[state.horizontalScrollPercent]);


    const adjustedVerticalTop = useMemo(()=>{
        let y = panelHeight * (1-(state.verticalScrollPercent/100));        
        if( y < 0) return 0;
        if(y > panelHeight - verticalScrollHeight) 
            return panelHeight - verticalScrollHeight;
        return y;        
    },[state.verticalScrollPercent]);
    console.log("state.verticalScrollPercent",state.verticalScrollPercent);
    console.log("state.viewBox",state.viewBox);
    console.log("adjustedVerticalTop",adjustedVerticalTop);
    console.log("props.repoDetails.branchPanelHeight",props.repoDetails.branchPanelHeight);

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100 overflow-x-hidden">
        <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
            <svg width={panelWidth} height={panelHeight} viewBox={`${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}` } style={{transform:`scale(1)`} }>
                    <g>
                        {
                            props.repoDetails.mergedLines.map(line=>(
                                <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                            ))
                        }
                        {
                            props.repoDetails.resolvedBranches.map(branch=>(
                                <SingleBranch key={branch._id} 
                                    branchDetails ={branch} 
                                    onCommitSelect={props.onCommitSelect} 
                                    selectedCommit={props.selectedCommit} 
                                    scrollLeft={(state.scrollLeft)}
                                    scrollTop={state.scrollTop} 
                                    panelWidth={panelWidth}
                                    
                                />
                            ))
                        }                                        
                    </g>
            </svg>
            <div className="d-flex bg-secondary position-relative" style={{width:`10px`}}>
                <div ref={verticalScrollElementRef as any} className="bg-danger position-absolute w-100" style={{height:`${verticalScrollHeight}px`,bottom:adjustedVerticalTop,left:0}}> </div>
            </div>
        </div>            
            <div className="d-flex w-100 bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div ref={horizontalScrollElementRef as any} className="position-absolute bg-danger h-100" style={{width:`${horizontalScrollWidth}px`, right:adjustedHorizontalRight,top:0}}></div>
            </div>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);