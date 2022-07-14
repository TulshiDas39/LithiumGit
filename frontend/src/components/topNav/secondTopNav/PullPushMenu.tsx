import { RendererEvents } from "common_library";
import React from "react"
import { FaAngleDoubleDown, FaAngleDoubleUp, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { shallowEqual } from "react-redux";
import { BranchUtils } from "../../../lib";
import { BranchGraphUtils } from "../../../lib/utils/BranchGraphUtils";
import { useSelectorTyped } from "../../../store/rootReducer";

function PullPushMenuComponent(){
    const store = useSelectorTyped(state=>({
        current:state.repository.statusCurrent,
        ahead:state.repository.aheadCount,
        behind:state.repository.behindCount,
    }),shallowEqual);

    console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
    const handlePull=()=>{
        BranchGraphUtils.showBrnchPanelLoader();
        window.ipcRenderer.send(RendererEvents.pull().channel,BranchUtils.repositoryDetails);
    }

    return <div className="row g-0 align-items-stretch ps-2">
        <div className="col-auto border px-1">
            <div className="row g-0 align-items-center h-100">
                <div className="col-auto">
                    {store.current}
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
        <div className="col-auto ps-1 pe-1 hover hover-bg-secondary">
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
    </div>
}

export const PullPushMenu = React.memo(PullPushMenuComponent);