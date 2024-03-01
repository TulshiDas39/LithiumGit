import { RendererEvents } from "common_library";
import React, { useMemo } from "react"
import { Dropdown } from "react-bootstrap";
import { FaAngleDoubleDown, FaAngleDoubleUp, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionUI } from "../../../store/slices/UiSlice";
import { IpcUtils } from "../../../lib/utils/IpcUtils";

function PullPushMenuComponent(){
    const store = useSelectorTyped(state=>({
        current:state.ui.status?.current,
        ahead:state.ui.status?.ahead,
        behind:state.ui.status?.behind,
        isDetached:!!state.ui.status?.isDetached
    }),shallowEqual);

    const dispatch = useDispatch();
    const currentText = useMemo(()=>{
        if(store.isDetached)
            return BranchUtils.repositoryDetails.headCommit.avrebHash+"(Detached)";
        return store.current;
    },[store.isDetached,store.current])
    const handlePull=()=>{
        dispatch(ActionUI.setLoader({text:"Pull in progress..."}));
        window.ipcRenderer.send(RendererEvents.pull().channel,BranchUtils.repositoryDetails);
    }

    const handlePush=()=>{
        if(!BranchUtils.repositoryDetails){
            debugger;
        }
        dispatch(ActionUI.setLoader({text:"Push in progress..."}));
        IpcUtils.trigerPush().then(()=>{
            dispatch(ActionUI.setLoader({text:"Checking status..."}));
            IpcUtils.getRepoStatus().finally(()=>{                
                dispatch(ActionUI.setLoader(undefined));
            })
        })
    }

    const handleFetch=(isAll:boolean)=>{
        dispatch(ActionUI.setLoader({text:"Fetching..."}));
        IpcUtils.fetch(isAll).then(_=>{
            dispatch(ActionUI.setLoader(undefined));
            IpcUtils.getRepoStatus();
        })
    }

    return <div className="row g-0 align-items-stretch ps-2">
        <div className="col-auto border px-1">
            <div className="row g-0 align-items-center h-100">
                <div className="col-auto">
                    {currentText}
                </div>
                <div className="col-auto ps-1">
                    <div className="row g-0 bg-info px-1 rounded">
                        <div className="col-auto">
                            <FaAngleDoubleUp />
                        </div>
                        <div className="col-auto">
                            {store.ahead}
                        </div>
                    </div>
                </div>
                <div className="col-auto ps-1">
                    <div className="row g-0 bg-info px-1 rounded">
                        <div className="col-auto">
                            <FaAngleDoubleDown />
                        </div>
                        <div className="col-auto">
                            {store.behind}
                        </div>
                    </div>
                </div>

            </div>

        </div>
        <div className="col-auto ps-1 pe-1 hover hover-bg-secondary" onClick={handlePush}>
            <div className="row g-0 align-items-center h-100">
                <div className="col-auto">
                    <FaArrowUp />
                </div>
                <div className="col-auto">
                    Push
                </div>
            </div>
        </div>
        <div className="col-auto ps-2 pe-1 hover hover-bg-secondary" onClick={handlePull}>
            <div className="row g-0 align-items-center h-100">
                <div className="col-auto">
                    <FaArrowDown />
                </div>
                <div className="col-auto">
                    Pull
                </div>
            </div>
        </div>
        <div className="col-auto ps-2 pe-1 cur-point">
            <div className="row g-0 align-items-center h-100">
                <div className="col-auto hover hover-bg-secondary border-end pe-2" onClick={_=> handleFetch(false)}>
                    <FaArrowDown />
                    <span>Fetch</span>
                </div>
                <div className="col-auto">
                    <Dropdown>
                        <Dropdown.Toggle className="bg-transparent hover-bg-secondary text-dark border-0 outline-none outline-none-focus hover px-2">                            
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="min-w-auto py-0" align={"end"}>
                            <Dropdown.Item className="" onClick={_=> handleFetch(true)}>Fetch All</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    </div>
}

export const PullPushMenu = React.memo(PullPushMenuComponent);