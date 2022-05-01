import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { shallowEqual, useStore } from "react-redux";
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
    scale:number;
    paddingTop:number;
    paddingLeft:number;
    scrollTop:number;
    scrollLeft:number;
    panelWidth:number;
    horizontalScrollPercent:number;
    verticalScrollPercent:number;
    viewBox:{x:number;y:number;width:number;height:number};
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const panelWidth = 900;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);

    const propsRef = useRef(props);

    useEffect(()=>{
        propsRef.current = props;
    },[props])

    useEffect(()=>{
        setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({
        scale:1,
        paddingLeft:0,
        paddingTop:0,
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        panelWidth:0,
        horizontalScrollPercent:0,
        verticalScrollPercent:0,
        viewBox:{x:props.repoDetails.branchPanelWidth - panelWidth,y:-10,width:panelWidth,height:panelHeight}
    });

    const stateRef = useRef(state);

    useEffect(()=>{
        stateRef.current = state;
    },[state])

    const initialHorizontalScrollPercent = useRef(state.horizontalScrollPercent);
    const isMounted = useRef(false);
    useEffect(()=>{
        isMounted.current = true;
    },[])
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        const horizontalPercent = (props.repoDetails?.headCommit.x*100)/props.repoDetails.branchPanelWidth;
        initialHorizontalScrollPercent.current = horizontalPercent;
        setState({horizontalScrollPercent:horizontalPercent});

    },[props.repoDetails?.headCommit])        
    
    const horizontalScrollWidth = useMemo(()=>{
        const width = state.viewBox.width / props.repoDetails.branchPanelWidth;
        return width*panelWidth;
    },[state.viewBox.width,props.repoDetails.branchPanelWidth]);

    const {currentMousePosition,elementRef} = useDrag();
    useEffect(()=>{
        if(currentMousePosition === undefined ) {
            if(isMounted.current){
                //initialHorizontalScrollPercent.current = stateRef.current.horizontalScrollPercent;
                setState((st)=>{
                    initialHorizontalScrollPercent.current = st.horizontalScrollPercent;
                    return st;
                })
            }
        }
        else{
            let initialX = (initialHorizontalScrollPercent.current/100)*panelWidth;
            const newX = initialX+ currentMousePosition!.x;
            const newPercent = (newX *100)/panelWidth;
            setState({
                horizontalScrollPercent: newPercent,
            })
        }        
    },[currentMousePosition])        
    
    useEffect(()=>{
        const x = propsRef.current.repoDetails.branchPanelWidth *(stateRef.current.horizontalScrollPercent/100);
        let viewBoxX = x - panelWidth/2;
        if(viewBoxX < 0) viewBoxX = 0;
        setState(st=>({
            ...st,
            viewBox:{
                ...st.viewBox,
                x: viewBoxX
            }
        }))
    },[state.horizontalScrollPercent]);

    const adjustedHorizontalRight = useMemo(()=>{
        let x = panelWidth * (1-(state.horizontalScrollPercent/100));        
        if( x < 0) return 0;
        return x;        
    },[state.horizontalScrollPercent]);
    
    

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100 overflow-x-hidden">
        <div className="d-flex w-100 align-items-stretch">
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
                                    scrollLeft={(state.scrollLeft - state.paddingLeft)/state.scale}
                                    scrollTop={state.scrollTop} 
                                    panelWidth={state.panelWidth}
                                    
                                />
                            ))
                        }                                        
                    </g>
            </svg>
            <div className="bg-secondary" style={{width:`10px`}}>
            </div>
        </div>            
            <div className="d-flex w-100 bg-secondary py-2 position-relative">
                <div ref={elementRef as any} className="position-absolute bg-danger h-100" style={{width:`${horizontalScrollWidth}px`, right:adjustedHorizontalRight,top:0}}></div>
            </div>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);