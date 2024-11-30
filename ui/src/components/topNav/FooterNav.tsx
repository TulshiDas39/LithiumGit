import React, { useEffect, useMemo, useRef } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { FaAdjust, FaSpinner } from "react-icons/fa";
import { ProgressBar } from "react-bootstrap";
import { ActionSavedData } from "../../store";
import { EnumTheme } from "common_library";
import { RepoUtils } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";

function FooterNavComponent(){
    const store = useSelectorTyped(state=>({
        loader:state.ui.loaders,
        sync:state.ui.synch,
        theme:state.savedData.configInfo.theme,
        repo:state.savedData.recentRepositories.find(_=>_.isSelected),
    }),shallowEqual);

    const dispatch = useDispatch();
    const refData = useRef({isMounted:false});

    useEffect(()=>{
        if(!refData.current.isMounted)
            return;
        document.documentElement.setAttribute('data-theme',store.theme);
    },[store.theme])

    const handleThemeClick=()=>{
        dispatch(ActionSavedData.toogleTheme());
    }

    useEffect(()=>{
        refData.current.isMounted = true;
    },[])
    const openOrigin=()=>{
        const url = RepoUtils.activeOriginUrl
        if(url){
            IpcUtils.openLink(url);
        }
    }
    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-5">
            <div className="d-flex align-items-center">
                {!!store.repo && <span className="hover-color cur-point ps-1 overflow-ellipsis" title={store.repo.activeOriginUrl} style={{maxWidth:'120px'}}
                    onClick={()=>openOrigin()}>{store.repo.activeOrigin}</span>}
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

        </div>
    </div>
}

export const FooterNav = React.memo(FooterNavComponent);