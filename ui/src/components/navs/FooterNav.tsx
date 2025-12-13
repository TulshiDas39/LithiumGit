import React, { useEffect, useRef } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { FaAdjust, FaCopy, FaRegBell, FaSpinner } from "react-icons/fa";
import { Overlay, ProgressBar } from "react-bootstrap";
import { ActionModals, ActionSavedData } from "../../store";
import { EnumTheme, IRemoteInfo } from "common_library";
import { IContextItem, RepoUtils, UiUtils, useMultiState } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ModalData } from "../modals/ModalData";
import { Notifications } from "./notification";
import icon from "../../assets/img/icon_green.png";

interface IState{
    remote?:IRemoteInfo;
    showOptions?:boolean;
}

function FooterNavComponent(){
    const store = useSelectorTyped(state=>({
        loader:state.ui.loaders,
        sync:state.ui.synch,
        theme:state.savedData.configInfo.theme,
        repo:state.savedData.recentRepositories.find(_=>_.isSelected),
    }),shallowEqual);

    const [state,setState]=useMultiState<IState>({});
    const optionTarget = useRef(null);

    const dispatch = useDispatch();
    const refData = useRef({isMounted:false,hoverIcon:false});

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
   

    const handleIconClik = (e: React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        const items:IContextItem[] = [
                {
                    text:`About LithiumGit`,
                    onClick:()=>{},
                },
                {
                    text:`Settings`,
                    onClick:()=>{},
                }            
            ]

            ModalData.contextModal.items = items;
            ModalData.contextModal.position = {x:e.clientX,y:e.clientY};
            UiUtils.openContextModal();
    }

    useEffect(()=>{
        const hideOptions = ()=>{
            if(refData.current.hoverIcon)
                return;
            setState({showOptions:false});
        }
        document.addEventListener("click",hideOptions);
        return ()=>{
            document.removeEventListener("click",hideOptions);
        }
    },[])

    return <div className="bg-second-color h-100 row g-0 align-items-center">
        <div className="col-5 h-100">
            <div className="d-flex align-items-center h-100">
                <div ref={optionTarget} className="px-1 h-100 d-flex align-items-center hover-bg" onClick={()=> setState({showOptions:!state.showOptions})} 
                onMouseEnter={()=>refData.current.hoverIcon=true} onMouseLeave={()=> refData.current.hoverIcon = false}>
                    <img src={icon} alt="icon" height={"80%"} width={"auto"} />   
                </div>
                <Overlay target={optionTarget.current} show={state.showOptions}  placement="top-end" onHide={()=> setState({showOptions:false})}>
                    {({
                    placement: _placement,
                    arrowProps: _arrowProps,
                    show: _show,
                    popper: _popper,
                    hasDoneInitialMeasure: _hasDoneInitialMeasure,                    
                    ...props
                    }) => (
                    <div
                        {...props}
                        style={{
                        position: 'absolute',
                        // backgroundColor: 'rgba(255, 100, 100, 0.85)',
                        padding: '2px 10px',
                        color: 'white',
                        borderRadius: 3,
                        ...props.style,
                        }}
                    >
                        Simple tooltip
                    </div>
                    )}
                </Overlay>
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