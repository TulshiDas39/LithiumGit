import React, { useEffect, useRef } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { FaAdjust, FaCopy, FaRegBell, FaSpinner } from "react-icons/fa";
import { ProgressBar } from "react-bootstrap";
import { ActionModals, ActionSavedData } from "../../store";
import { EnumTheme, IRemoteInfo } from "common_library";
import { RepoUtils, UiUtils, useMultiState } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ModalData } from "../modals/ModalData";
import {BellWithDot} from "../common"
import { Notifications } from "./notification";

interface IState{
    remote?:IRemoteInfo;
}

function FooterNavComponent(){
    const store = useSelectorTyped(state=>({
        loader:state.ui.loaders,
        sync:state.ui.synch,
        theme:state.savedData.configInfo.theme,
        repo:state.savedData.recentRepositories.find(_=>_.isSelected),
    }),shallowEqual);

    const [state,setState]=useMultiState<IState>({});

    const dispatch = useDispatch();
    const refData = useRef({isMounted:false});

    useEffect(()=>{
        if(!refData.current.isMounted)
            return;
        document.documentElement.setAttribute('data-theme',store.theme);
    },[store.theme])

    useEffect(()=>{
        if(!store.repo)
            return ;
        RepoUtils.enSureUpdate(store.repo?.path).then(()=>{
            const remote = RepoUtils.activeRemoteInfo;
            setState({remote});
        })
    },[store.repo?.activeOrigin,store.repo?.path]);

    const handleThemeClick=()=>{
        dispatch(ActionSavedData.toogleTheme());
    }

    useEffect(()=>{
        refData.current.isMounted = true;
    },[])
    const openOrigin=()=>{
        const url = state.remote!.url;
        if(url){
            IpcUtils.openLink(url);
        }
    }

    const copyOrigin=()=>{
        UiUtils.copy(state.remote!.url);
        ModalData.appToast.message = "Copied.";
        dispatch(ActionModals.showToast());
    }

    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-5">
            <div className="d-flex align-items-center">
                {!!state.remote && <span className="ps-1 d-flex">
                        <span onClick={()=>openOrigin()} className="hover-color cur-point overflow-ellipsis" title={state.remote.url} style={{maxWidth:'120px'}}>{state.remote.name}</span>
                        <span className="ps-1 small"> <span onClick={()=>copyOrigin()} title="Copy origin" className="small hover-color cur-point overflow-ellipsis"><FaCopy className="click-effect" /></span></span>
                    </span>}
                {!!store.sync && (
                    <div className="ps-3 d-flex align-items-center">
                        <FaSpinner className="spinner" />
                        <span className="ps-2">{store.sync.text}</span>
                    </div>
                )}
            </div>            
        </div>      
        <div className="col-6 text-center">
            <div className="d-flex align-items-center">
                <div className="text-center">                
                        {!!store.loader?.length && <ProgressBar className="" style={{width:300}} animated now={100} variant="success" key={1} label="" />}                
                </div>
                <div className="ps-3 text-nowrap overflow-ellipsis">
                    {!!store.loader?.length && <span>{store.loader[store.loader.length-1].text}</span>}
                </div>
            </div>            
        </div>
        
        <div className="col-1 d-flex align-items-center justify-content-end">            
            <span className="pe-2 d-flex align-items-center">
                <FaAdjust title={`Switch to ${store.theme === EnumTheme.Dark?"light":"dark"} theme`} className="hover" onClick={()=> handleThemeClick()}/>
            </span>

            <Notifications />

        </div>
    </div>
}

export const FooterNav = React.memo(FooterNavComponent);