import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { Fragment, useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { BranchUtils, IViewBox, useMultiState } from "../../../../lib";
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
    horizontalScrollRatio:number;
    verticalScrollRatio:number;
    viewBox:IViewBox;
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    horizontalScrollLeft:number;
    panelWidth:number;
    horizontalScrollWidth:number;
    zoomValue:number;
}

function TestCompComponent(){
    const testRef = useRef<HTMLDivElement>();
    const testRef2 = useRef<number>(1);
    const [state,setState]=useState(1);
    useEffect(()=>{
        console.log("mounted...");
        setState(2);
    },[])
    
    useEffect(()=>{
        console.log("test ref2 changed...");
        console.log("testRef2.current inside useEffect",testRef2.current);
    },[testRef2.current]);
    useEffect(()=>{
        console.log("test ref changed...");
        console.log("testRef.current inside useEffect",testRef.current);
        testRef2.current = 2;
    },[testRef.current]);
    useEffect(()=>{
        console.log("state changed...");
        console.log("state inside useEffect",state);
    },[state]);

    console.log("rendering testComp..........");
    console.log("testRef.current",testRef.current);
    
    
    return <div ref={testRef as any}>test</div>
}

const TestComp = React.memo(TestCompComponent);

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    //const panelWidth = 865;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);

    useEffect(()=>{
        //setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])    

    const [state,setState]=useMultiState<IState>({
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox:{x:0,y:0,width:0,height:0},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
        panelWidth:-1,
        horizontalScrollWidth:0,
        zoomValue:0,
    });

    const horizontalScrollContainerWidth = state.panelWidth+10;


    const dataRef = useRef({
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
    });

    const horizontalScrollContainerRef = useRef<HTMLDivElement>();
    useEffect(()=>{
        dataRef.current.isMounted = true;
    },[])

    // const horizontalScrollWidth = useMemo(()=>{
    //     if(state.panelWidth === -1) return 0;        
    //     let totalWidth = props.repoDetails.branchPanelWidth;
    //     if(totalWidth < state.panelWidth) totalWidth = state.panelWidth;
    //     const width = state.viewBox.width / totalWidth;
    //     return width*state.panelWidth;
    // },[state.viewBox.width,props.repoDetails.branchPanelWidth,state.panelWidth]);

    const verticalScrollHeight = useMemo(()=>{        
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        const height = state.viewBox.height / totalHeight;        
        return height*panelHeight;
    },[state.viewBox.height,props.repoDetails.branchPanelHeight]);
    console.log("horizontalScrollWidth",state.horizontalScrollWidth);

    useEffect(()=>{
        if(props.repoDetails?.headCommit && state.panelWidth !== -1) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        else return;
        let totalWidth = props.repoDetails.branchPanelWidth;
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        debugger;
        if(totalWidth < state.panelWidth) totalHeight = state.panelWidth;
        const horizontalRatio = props.repoDetails?.headCommit.x/totalWidth;
        const verticalRatio = props.repoDetails?.headCommit.ownerBranch.y/totalHeight;
        const verticalScrollTop = (panelHeight-verticalScrollHeight)*verticalRatio;
        let horizontalScrollLeft = (horizontalScrollContainerWidth-state.horizontalScrollWidth)*horizontalRatio;
        horizontalScrollLeft -= (state.horizontalScrollWidth/2);        
        dataRef.current.initialVerticalScrollTop = verticalScrollTop;
        dataRef.current.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > state.panelWidth) viewBoxX = x- (state.panelWidth/2);



        const y = totalHeight *verticalRatio;
        let viewBoxY = 0;
        if(totalHeight > panelHeight) viewBoxY = y - (panelHeight/2);        

        setState({
            horizontalScrollRatio:horizontalRatio,
            verticalScrollRatio:verticalRatio,
            verticalScrollTop:verticalScrollTop,
            horizontalScrollLeft:horizontalScrollLeft,
            viewBox:{
                ...state.viewBox,
                x:viewBoxX,
                y:viewBoxY,
                width:state.panelWidth,
                height:panelHeight,
            }
        });

    },[props.repoDetails?.headCommit,state.panelWidth])                

    const {currentMousePosition: horizontalScrollMousePosition,elementRef: horizontalScrollElementRef} = useDrag();
    const {currentMousePosition:verticalScrollMousePosition,elementRef:verticalScrollElementRef} = useDrag();
    useEffect(()=>{
        if(horizontalScrollMousePosition === undefined ) {
            if(!state.notScrolledHorizontallyYet){                
                dataRef.current.initialHorizontalScrollLeft = state.horizontalScrollLeft;
            }
        }
        else{
            if(state.panelWidth <= state.horizontalScrollWidth) return;
            let newLeft = dataRef.current.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = state.panelWidth - state.horizontalScrollWidth;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;            

            let totalWidth = props.repoDetails.branchPanelWidth;
            if(totalWidth <state.panelWidth) totalWidth = state.panelWidth;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (state.panelWidth/2);            

            setState({
                horizontalScrollRatio: newRatio,
                horizontalScrollLeft:newLeft,
                notScrolledHorizontallyYet:false,       
                viewBox:{
                    ...state.viewBox,
                    x: viewBoxX
                }
            })
        }        
    },[horizontalScrollMousePosition])        

    useEffect(()=>{
        if(verticalScrollMousePosition === undefined ) {
            if(!state.notScrolledVerticallyYet){                
                dataRef.current.initialVerticalScrollTop = state.verticalScrollTop;
            }
        }
        else{
            if(panelHeight <= verticalScrollHeight) return;
            let newY = dataRef.current.initialVerticalScrollTop + verticalScrollMousePosition!.y;
            const maxY = panelHeight - verticalScrollHeight;
            if(newY > maxY) newY = maxY;
            else if(newY < 0) newY = 0;
            const newRatio = newY/(panelHeight-verticalScrollHeight);
            let totalHeight = props.repoDetails.branchPanelHeight;
            if(totalHeight < panelHeight) totalHeight = panelHeight;

            const y = totalHeight *newRatio;
            let viewBoxY = y - (panelHeight/2);

            setState({
                verticalScrollRatio: newRatio,
                notScrolledVerticallyYet:false,
                verticalScrollTop:newY,
                viewBox:{
                    ...state.viewBox,
                    y:viewBoxY
                }
            })
        }        
    },[verticalScrollMousePosition])



    useEffect(()=>{
        if(horizontalScrollContainerRef.current){
            const width = Math.floor(horizontalScrollContainerRef.current.getBoundingClientRect().width);
            const newPanelWidth = width-10;
            if(state.panelWidth != newPanelWidth){
                let viewBox = {x:0,y:0} as IViewBox;
                viewBox.width = newPanelWidth;
                viewBox.height = panelHeight;
                viewBox = BranchUtils.getViewBoxValue(viewBox,1);
                let totalWidth = props.repoDetails.branchPanelWidth;
                if(totalWidth < state.panelWidth) totalWidth = state.panelWidth;
                const widthRatio = viewBox.width / totalWidth;
                const horizontalScrollWidth = widthRatio*newPanelWidth;
                setState({
                    panelWidth:newPanelWidth,
                    viewBox:viewBox,
                    horizontalScrollWidth:horizontalScrollWidth,
                });
            }
        }
    },[horizontalScrollContainerRef.current])
    console.log("state.horizontalScrollLeft",state.horizontalScrollLeft)
    console.log("horizontalScrollContainerWidth",horizontalScrollContainerWidth)

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div ref={horizontalScrollContainerRef as any} id="branchPanel" className="w-100 overflow-x-hidden">
        {state.panelWidth !== -1 && <Fragment>
            <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <svg width={state.panelWidth} height={panelHeight} viewBox={`${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}` } style={{transform:`scale(1)`} }>
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
                                        panelWidth={state.panelWidth}
                                        
                                    />
                                ))
                            }                                        
                        </g>
                </svg>
                <div className="d-flex bg-secondary position-relative" style={{width:`10px`}}>
                    <div ref={verticalScrollElementRef as any} className="bg-danger position-absolute w-100" style={{height:`${verticalScrollHeight}px`,top:state.verticalScrollTop,left:0}}> </div>
                </div>
            </div>            
            <div className="d-flex w-100 bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div ref={horizontalScrollElementRef as any} className="position-absolute bg-danger h-100" style={{width:`${state.horizontalScrollWidth}px`, left:state.horizontalScrollLeft,top:0}}></div>
            </div>           
        </Fragment>}
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);