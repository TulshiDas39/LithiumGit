import { RendererEvents, StringUtils } from "common_library";
import React, { useEffect, useMemo, useRef } from "react"
import { Dropdown } from "react-bootstrap";
import { FaAngleDoubleDown, FaAngleDoubleUp, FaArrowDown, FaCaretDown } from "react-icons/fa";
import { shallowEqual, useDispatch } from "react-redux";
import { RepoUtils, EnumModals, useMultiState } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionUI, ILoaderInfo } from "../../../store/slices/UiSlice";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionModals } from "../../../store";
import { AppButton } from "../../common";
import { ModalData } from "../../modals/ModalData";
import { Messages } from "../../../lib/constants";
import { GitUtils } from "../../../lib/utils/GitUtils";

interface IStatus{
    showPushTo:boolean;
    showPullFrom:boolean;
    showFetchAll:boolean;
    
}

function PullPushMenuComponent(){
    const store = useSelectorTyped(state=>({
        current:state.ui.status?.current,
        hashOfHead:state.ui.status?.headCommit?.avrebHash,
        ahead:state.ui.status?.ahead,
        behind:state.ui.status?.behind,
        isDetached:!!state.ui.status?.isDetached,
        trackingBranch:state.ui.status?.trackingBranch,
    }),shallowEqual);

    const [state,setState] = useMultiState<IStatus>({showPushTo:false,
        showPullFrom:false,showFetchAll:false});

    const refData = useRef({onHoverPushTo:false,onHoverPullFrom:false,onHoverFetchAll:false});

    const dispatch = useDispatch();
    const currentText = useMemo(()=>{
        if(store.isDetached)
            return store.hashOfHead+"(Detached)";
        return store.current;
    },[store.isDetached,store.current,store.hashOfHead])

    const upStreamBranch = useMemo(()=>{
        if(store.isDetached){
            return RepoUtils.repositoryDetails?.headCommit?.ownerBranch.name || "";
        }
        else if(store.trackingBranch){
            return store.trackingBranch;
        }
        return store.current;
    },[store.isDetached,store.current,store.trackingBranch]);

    const handlePull=()=>{
        const loader:ILoaderInfo = {text:Messages.pull,id:StringUtils.uuidv4()};
        dispatch(ActionUI.setLoader(loader));
        const options:string[] = [];
        if(upStreamBranch){
            const originName = RepoUtils.activeOriginName;
            options.push(originName,upStreamBranch);
        }
        IpcUtils.trigerPull(options).then((r)=>{
            if(!r.error){
                ModalData.appToast.message = Messages.pullSuccess;
                dispatch(ActionModals.showModal(EnumModals.TOAST));
            }
            dispatch(ActionUI.removeLoader(loader.id));
            GitUtils.getStatus();
        })
    }

    const handlePush=()=>{
        const loader:ILoaderInfo = {text:Messages.push,id:StringUtils.uuidv4()};
        dispatch(ActionUI.setLoader(loader));
        const options:string[] = [];
        if(upStreamBranch){
            const originName = RepoUtils.activeOriginName;
            options.push(originName,upStreamBranch);
        }
        IpcUtils.trigerPush(options).then((r)=>{
            if(!r.error){
                ModalData.appToast.message = Messages.pushSuccess;
                dispatch(ActionModals.showModal(EnumModals.TOAST));
            }
            
            dispatch(ActionUI.removeLoader(loader.id));
            GitUtils.getStatus();
        })
    }

    const handleFetch=(isAll:boolean)=>{
        if(isAll){
            setState({showFetchAll:false});
        }
        GitUtils.fetch(isAll).then(r=>{
            if(!r.error){
                GitUtils.getStatus();
            }
        });
    }

    const handlePushCaretClick=()=>{        
        setState({showPushTo:!state.showPushTo});
    }

    const handlePullCaretClick=()=>{        
        setState({showPullFrom:!state.showPullFrom});
    }
    const handleFetchCaretClick=()=>{        
        setState({showFetchAll:!state.showFetchAll});
    }

    useEffect(()=>{
        const handler = ()=>{
            if(!refData.current.onHoverPushTo){
                setState({showPushTo:false})    
            }
            if(!refData.current.onHoverPullFrom){
                setState({showPullFrom:false})    
            }
            if(!refData.current.onHoverFetchAll){
                setState({showFetchAll:false})    
            }            
        }
        document.addEventListener("click",handler);

        return ()=>{
            document.removeEventListener("click",handler);
        }
    },[])

    const handlePushTo = ()=>{
        setState({showPushTo:false});
        dispatch(ActionModals.showModal(EnumModals.PUSH_TO));
    }
    const handlePullFrom = ()=>{
        setState({showPullFrom:false});
        dispatch(ActionModals.showModal(EnumModals.PULL_FROM));
    }    

    return <div className="row g-0 align-items-stretch ps-2 flex-shrink-0">
        <div className="col-auto ">
            <div className="d-flex justify-content-center h-100">
                <div className="row g-0 align-items-center h-100 branchBox px-1 hover-shadow" onClick={()=> dispatch(ActionModals.showModal(EnumModals.CHECKOUT))}>
                    <div className="col-auto overflow-hidden" style={{maxWidth:200,textOverflow:'ellipsis'}} 
                        title={currentText!}>
                        {currentText}
                    </div>
                    <div className="col-auto ps-1">
                        <div className="row g-0 bg-success px-1 rounded">
                            <div className="col-auto">
                                <FaAngleDoubleUp className="color-slight" />
                            </div>
                            <div className="col-auto color-slight">
                                {store.ahead}
                            </div>
                        </div>
                    </div>
                    <div className="col-auto ps-1">
                        <div className="row g-0 bg-success px-1 rounded">
                            <div className="col-auto">
                                <FaAngleDoubleDown className="color-slight" />
                            </div>
                            <div className="col-auto color-slight">
                                {store.behind}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
        <div className="col-auto ps-1 pe-1">
            <div className="row g-0 align-items-stretch h-100">
                <div className="col-auto d-flex">
                    <AppButton title={`Push To ${upStreamBranch}`} className="default-button" text="Push" type="default" onClick={()=>handlePush()} /> 
                </div>                
                <div className="border-secondary col-auto d-flex position-relative" 
                    onMouseEnter={()=> {refData.current.onHoverPushTo = true}} onMouseLeave={()=>{refData.current.onHoverPushTo = false}}>
                        <AppButton type="default" className="default-button " style={{width:15,paddingLeft:'8px', paddingRight:'8px'}}
                            onClick={handlePushCaretClick}>
                            <span className=""><FaCaretDown /></span> 
                        </AppButton>
                        {state.showPushTo && <div className="position-absolute py-1 px-2 default-button" style={{top:'105%', right:0,zIndex:99}}
                            onClick={handlePushTo}>
                            <span className="text-nowrap">Push To &gt;</span>
                        </div>}
                    
                </div>
            </div>
        </div>
        <div className="col-auto ps-1 pe-1">
            <div className="row g-0 align-items-stretch h-100">
                <div className="col-auto d-flex">
                    <AppButton title={`Pull from ${upStreamBranch}`} text="Pull" type="default" className="default-button" onClick={handlePull} />
                </div>
                <div className="border-secondary border-start-0 col-auto d-flex position-relative"
                    onMouseEnter={()=> {refData.current.onHoverPullFrom = true}} onMouseLeave={()=>{refData.current.onHoverPullFrom = false}}>
                    <AppButton type="default" className="default-button" style={{width:15,paddingLeft:'8px', paddingRight:'8px'}}
                        onClick={handlePullCaretClick}>
                        <span> <FaCaretDown /></span>
                    </AppButton>
                
                    {state.showPullFrom && <div className="position-absolute py-1 px-2 default-button" style={{top:'105%', right:0,zIndex:99}}
                        onClick={handlePullFrom}>
                        <span className="text-nowrap">Pull From &gt;</span>
                    </div>}
                </div>
            </div>
        </div>

        <div className="col-auto ps-1 pe-1">
            <div className="row g-0 align-items-stretch h-100">
                <div className="col-auto d-flex ">
                    <AppButton title={`Fetch from ${upStreamBranch}`} text="Fetch" type="default" className="default-button" onClick={()=> handleFetch(false)} />
                </div>
                <div className="border-secondary col-auto d-flex position-relative"
                    onMouseEnter={()=> {refData.current.onHoverFetchAll = true}} onMouseLeave={()=>{refData.current.onHoverFetchAll = false}}>                    
                    <AppButton type="default" className="default-button" style={{width:15,paddingLeft:'8px', paddingRight:'8px'}}
                        onClick={handleFetchCaretClick}>
                        <span> <FaCaretDown /></span>
                    </AppButton>
                    {state.showFetchAll && <div className="position-absolute py-1 px-2 default-button" style={{top:'105%', right:0,zIndex:99}}
                        onClick={_=> handleFetch(true)}>
                        <span className="text-nowrap">Fetch all</span>
                    </div>}
                </div>
            </div>
        </div>
    </div>
}

export const PullPushMenu = React.memo(PullPushMenuComponent);