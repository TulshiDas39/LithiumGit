import React, { useEffect, useMemo, useRef } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { FaAdjust, FaCopy, FaSpinner } from "react-icons/fa";
import { Overlay, ProgressBar } from "react-bootstrap";
import { ActionModals, ActionSavedData } from "../../store";
import { EnumLinefeed, EnumTheme, IRemoteInfo } from "common_library";
import { Data, DataUtils, EnumModals, EnumSelectedRepoTab, RepoUtils, UiUtils, useMultiState } from "../../lib";
import { IpcUtils } from "../../lib/utils/IpcUtils";
import { ModalData } from "../modals/ModalData";
import { Notifications } from "./notification";
import icon from "../../assets/img/icon_green.png";
import { ActionUI } from "../../store/slices/UiSlice";

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
                        className="rounded-0"
                        style={{
                        position: 'absolute',
                        backgroundColor: 'inherit',
                        padding: '2px 20px',
                        borderRadius: 3,                        
                        ...props.style,
                        }}
                    >
                        <div onClick={(e)=>dispatch(ActionModals.showModal(EnumModals.ABOUT_LITHIUMGIT))} className="hover-color cur-point py-1">About LithiumGit</div>
                        {/* <div onClick={(e)=>{}} className="hover-color cur-point py-1">Settings</div> */}
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
        <div className="col-5 text-center">
            <div className="d-flex align-items-center">
                <div className="text-center">                
                        {!!store.loader?.length && <ProgressBar className="" style={{width:300}} animated now={100} variant="success" key={1} label="" />}                
                </div>
                <div className="ps-3 text-nowrap overflow-ellipsis">
                    {!!store.loader?.length && <span>{store.loader[store.loader.length-1].text}</span>}
                </div>
            </div>            
        </div>
        
        <div className="col-2 d-flex align-items-center justify-content-end">
            <EncodingSelection />
            <CrlfSelection />
            <span className="pe-2 d-flex align-items-center">
                <FaAdjust title={`Switch to ${store.theme === EnumTheme.Dark?"light":"dark"} theme`} className="hover" onClick={()=> handleThemeClick()}/>
            </span>

            <Notifications />

        </div>
    </div>
}

export const FooterNav = React.memo(FooterNavComponent);

//TODO: investigate why this comonent is rendering on every click on document.
function CrlfSelectionComponent(){
    const store = useSelectorTyped(state=>({
        lfType: state.ui.lfType,
        selectedTab:state.ui.selectedRepoTab,
    }),shallowEqual);

    const dispatch = useDispatch();
    const optionTarget = useRef(null);
    const [state,setState] = useMultiState<{showOptions?:boolean}>({});

    const handleOptionClick = (type:EnumLinefeed)=>{
        if(type === store.lfType)
            return;
        ModalData.confirmationModal.message  = `Are you sure you want to switch line feed type to '${type === EnumLinefeed.CRLF? "CRLF":"LF"}'?`;
        ModalData.confirmationModal.YesHandler = ()=>{
            dispatch(ActionUI.setLinefeedType(type));
            if(store.selectedTab === EnumSelectedRepoTab.CHANGES){
                DataUtils.handleLFTypeChangeOfModifiedFile();
            }
        };
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        setState({showOptions:false});
    }

    const refData = useRef({hoverTarget:false});    

    useEffect(()=>{
        const hideOptions = ()=>{
            if(refData.current.hoverTarget)
                return;
            setState({showOptions:false});
        }
        document.addEventListener("click",hideOptions);
        return ()=>{
            document.removeEventListener("click",hideOptions);
        }
    },[])

    if(!store.lfType|| store.selectedTab !== EnumSelectedRepoTab.CHANGES)
        return null;

    return <div className="px-1">
                <div ref={optionTarget} className="cur-default px-1 h-100 d-flex align-items-center hover-bg" onClick={()=> setState({showOptions:!state.showOptions})} 
                    onMouseEnter={()=>refData.current.hoverTarget=true} onMouseLeave={()=> refData.current.hoverTarget = false}>
                        {store.lfType === EnumLinefeed.CRLF? "CRLF":"LF"}   
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
                            className="rounded-0 border"
                            style={{
                            position: 'absolute',
                            backgroundColor: 'inherit',
                            padding: '2px 0px',
                            borderRadius: 3,
                            zIndex:99,                        
                            ...props.style,
                            }}
                        >
                            <div onClick={(e)=>handleOptionClick(EnumLinefeed.LF)} className="hover-color cur-point py-1 px-4 hover-bg">LF</div>
                            <div onClick={(e)=>handleOptionClick(EnumLinefeed.CRLF)} className="hover-color cur-point py-1 px-4 hover-bg">CRLF</div>
                        </div>
                        )}
                    </Overlay>
                </div>
}

const CrlfSelection = React.memo(CrlfSelectionComponent);

interface IEncodingSelectionState{
    showOptions?:boolean;
}

function EncodingSelection(){
    const store = useSelectorTyped(state=>({
        encoding: state.ui.encoding,
        selectedTab:state.ui.selectedRepoTab,
    }),shallowEqual);

    const encodingList = useMemo(()=>{
        return Data.appData?.encodingList || [];
    },[Data.appData?.encodingList])

    const [state,setState] = useMultiState<IEncodingSelectionState>({});

    const dispatch = useDispatch();

    const optionTarget = useRef(null);
    const refData = useRef({hoverTarget:false});
    
    const handleOptionClick = (encoding:string)=>{
        if(encoding === store.encoding)
            return;
        ModalData.confirmationModal.message  = `Are you sure you want to switch encoding type to '${encoding}'?`;
        ModalData.confirmationModal.YesHandler = ()=>{
            dispatch(ActionUI.setEncoding(encoding));
            if(store.selectedTab === EnumSelectedRepoTab.CHANGES){
                DataUtils.handleEncodingChangeOfModifiedFile(encoding);
            }
        };
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        setState({showOptions:false});
    }    

    useEffect(()=>{
        const hideOptions = ()=>{
            if(refData.current.hoverTarget)
                return;
            setState({showOptions:false});
        }
        document.addEventListener("click",hideOptions);
        return ()=>{
            document.removeEventListener("click",hideOptions);
        }
    },[])

    useEffect(()=>{
        if(!state.showOptions)
            return;
        document.querySelector('.footer-encoding-selection .selected')?.scrollIntoView({block:'center'});
    }, [state.showOptions])
    
    
    if(!store.encoding || store.selectedTab !== EnumSelectedRepoTab.CHANGES)
        return null;

    return <div className="px-1">
                <div ref={optionTarget} className="cur-default px-1  d-flex align-items-center hover-bg" onClick={()=> setState({showOptions:!state.showOptions})} 
                    onMouseEnter={()=>refData.current.hoverTarget=true} onMouseLeave={()=> refData.current.hoverTarget = false}>
                        <div title={store.encoding} className="overflow-ellipsis text-nowrap" style={{maxWidth:'50px'}}>{store.encoding.toUpperCase()}</div>
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
                            className="rounded-0 border footer-encoding-selection"
                            style={{
                            position: 'absolute',
                            backgroundColor: 'inherit',
                            padding: '2px 0px',
                            borderRadius: 3,
                            maxHeight:500,
                            overflowY:'auto',                        
                            ...props.style,
                            }}
                        >
                            {encodingList.map((encoding)=>(
                                    <div key={encoding} onClick={(e)=>handleOptionClick(encoding)} className={`hover-color cur-point py-1 px-4 hover-bg ${store.encoding === encoding?"selected":""}`}>{encoding.toUpperCase()}</div>
                                )
                            )}                            
                        </div>
                        )}
                    </Overlay>
                </div>

}
