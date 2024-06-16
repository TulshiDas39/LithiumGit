import { IStash } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { EnumModals, useDrag, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StashProperty } from "./StashProperty";
import { StashChangeView } from "./StashChangeView";
import { FaPlus, FaStore, FaTrash } from "react-icons/fa";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";

interface IState{
    stashes:IStash[];
    selectedItem?:IStash;
    hoveredItem?:IStash;
}

function StashesComponent(){
    const dispatch = useDispatch();
    const [state,setState] = useMultiState<IState>({
        stashes:[],
    });

    const getAll = ()=>{
        IpcUtils.getStashes().then(res=>{
            if(res.result){
                setState({stashes:res.result,selectedItem:res.result?.[0]});
            }
        });
    }

    useEffect(()=>{
        getAll();
    },[])
    
    const bottomHeightRef = useRef(200);
    const positionRef = useRef(0);
    const {currentMousePosition:position,elementRef:resizer} = useDrag();

    const bottomHeight = useMemo(()=>{
        const curHeight = bottomHeightRef.current - positionRef.current;
        const height = Math.max(50, curHeight);
        if(!position){
            bottomHeightRef.current = height;
            positionRef.current = 0;
        }
        else{
            positionRef.current = position.y;
        }
        return height;
    },[position?.y])

    const popItem = (e:React.MouseEvent<HTMLSpanElement, MouseEvent>, index:number)=>{
        e.preventDefault();
        ModalData.confirmationModal.message = "Pop the stash?";
        ModalData.confirmationModal.YesHandler = ()=>{
            executeApply(index).then((r)=>{
                if(!r.error){
                    executeDelete(index).then(()=>{
                        IpcUtils.getRepoStatus();
                    });
                }
            });
        }

        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }

    const executeApply = (index:number)=>{
        const options:string[] = ["apply",`stash@{${index}}`];
        return IpcUtils.runStash(options);
    }

    const applyItem = (e:React.MouseEvent<HTMLSpanElement, MouseEvent>,index:number)=>{
        e.preventDefault();
        ModalData.confirmationModal.message = "Apply the stash?";
        ModalData.confirmationModal.YesHandler = ()=>{
            executeApply(index).then(()=>{
                IpcUtils.getRepoStatus();
            });
        }

        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        
    }

    const executeDelete=(index:number)=>{
        const options:string[] = ["drop",`stash@{${index}}`];
        return IpcUtils.runStash(options);
    }

    const deleteItem = (e:React.MouseEvent<HTMLSpanElement, MouseEvent>,index:number)=>{
        e.preventDefault();
        ModalData.confirmationModal.message = "Delete the stash?";
        ModalData.confirmationModal.YesHandler = ()=>{
            executeDelete(index).then(()=>{
                getAll();
            });
        }

        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }

    return <div className="px-2 pt-2 h-100 w-100">
        <div className="w-100 d-flex" style={{height:`calc(100% - ${bottomHeight+3}px)`}} >
            <div className="w-75 container" onMouseLeave={()=> setState({hoveredItem:undefined})}>
                {state.stashes.map((st,index)=>(
                    <div key={index} className={`row g-0 align-items-center flex-nowrap w-100 hover ${st.hash === state.selectedItem?.hash?'selected':''}`}
                        onMouseEnter= {_ => setState({hoveredItem:st})} onClick={()=> setState({selectedItem:st})} >
                        <div className={`col-auto overflow-hidden align-items-center flex-shrink-1`}
                        style={{textOverflow:'ellipsis'}}>
                            <span className={`pe-1 flex-shrink-0 text-nowrap`}>{`{${index}} ${st.message}`}</span>                            
                        </div>
                        <div className="col-auto align-items-center flex-nowrap flex-grow-1 overflow-hidden text-end">                        
                                {state.hoveredItem?.hash === st.hash && <Fragment>
                                    <span className="hover" title="pop" onClick={_=> popItem(_,index)}><FaStore /></span>
                                    <span className="px-1" />
                                    <span className="hover" title="apply" onClick={_=>applyItem(_,index)}><FaPlus /></span>
                                    <span className="px-1" />
                                    <span className="hover" title="delete" onClick={_=>deleteItem(_,index)}><FaTrash /></span>                                                 
                                </Fragment>}                                
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-100 w-25 border-start">
                {!!state.selectedItem && <StashProperty stash={state.selectedItem} />}
            </div>
            
        </div>
        <div ref={resizer as any} className="bg-second-color cur-resize-v" style={{ height: '3px' }} />
        <div className="w-100" style={{height:`${bottomHeight}px`}}>
                <StashChangeView stash={state.selectedItem} />
        </div>
        
    </div>
}

export const Stashes = React.memo(StashesComponent);