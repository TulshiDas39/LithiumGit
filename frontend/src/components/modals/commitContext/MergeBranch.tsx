import React, { Fragment, useRef } from "react";
import { ModalData } from "../ModalData";
import { ContextData, IBaseProps, Option } from "./ContextData";
import { useDispatch } from "react-redux";
import { ActionChanges, ActionModals } from "../../../store";
import { EnumChangeGroup, EnumModals, EnumSelectedRepoTab, RepoUtils } from "../../../lib";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../lib/utils/GitUtils";
import { ActionUI } from "../../../store/slices/UiSlice";

interface IProps extends IBaseProps{
    referredLocalBranches:string[];
    mouseOver?:Option;
}

function MergeBranchComponent(props:IProps){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const refData = useRef({mergerCommitMessage:"",onHover:false,show:false});

    const mergeBranch=(branch:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = RepoUtils.generateMergeBranchMessage(branch)!;      
        const options = [branch,"--no-commit","--no-ff"];
        IpcUtils.merge(options).then(()=>{
            GitUtils.getStatus().then((r)=>{
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                if(r.conflicted?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.CONFLICTED}));
                }
                else if(r.staged?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.STAGED}));
                }
            });
        })
    }

    const mergeCommit=(hash:string)=>{
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        refData.current.mergerCommitMessage = RepoUtils.generateMergeCommitMessage(hash)!;      
        const options = [hash,"--no-commit","--no-ff"];
        IpcUtils.merge(options).then((r)=>{            
            GitUtils.getStatus().then(r=>{
                dispatch(ActionUI.setSelectedRepoTab(EnumSelectedRepoTab.CHANGES));
                if(r.conflicted?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.CONFLICTED}));
                }
                else if(r.staged?.length){
                    dispatch(ActionChanges.updateData({selectedTab:EnumChangeGroup.STAGED}));
                }
            });
        });        
    }

    return <Fragment>
        {
                        !Data.selectedCommit?.isHead && props.referredLocalBranches.length > 0 && 
                            <div className={`row g-0 ${ContextData.optionClasses}`}>
                                {
                                    props.referredLocalBranches.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> props.onMouseHover(Option.Merge)}>
                                            <span className="flex-grow-1">Merge branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(props.mouseOver === Option.Merge) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                props.referredLocalBranches.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3">
                                                        <span className="hover" onClick={() => mergeBranch(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default " onClick={() => mergeBranch(props.referredLocalBranches[0])}>Merge branch '{props.referredLocalBranches[0]}'</div>
                                }                                
                            </div>
                    }
                    {!Data.selectedCommit?.isHead && <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                        <div className="col-12 hover cur-default " onClick={()=>mergeCommit(Data.selectedCommit?.hash)}>Merge this commit</div>
                    </div>}
    </Fragment>
}

export const MergeBranch = React.memo(MergeBranchComponent);