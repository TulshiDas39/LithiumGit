import React, { useEffect, useRef } from "react"
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../store/rootReducer";
import { EnumModals, IContextItem, IPositition, UiUtils, useMultiState } from "../../lib";
import { Modal } from "react-bootstrap";
import { InitialModalData, ModalData } from "./ModalData";
import { ActionModals } from "../../store";

interface IState{
    position:IPositition;
}

function ContextModalComponent(){
    const Data = ModalData.contextModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);
    
    const [state, setState] = useMultiState({
        position:{x:0,y:0}
    } as IState);

    const refData = useRef({onHover:false,show:false});

    useEffect(()=>{
        refData.current.show = store.show;
        if(store.show){
            let elem = document.querySelector(".context") as HTMLElement;
            if(elem){
                elem.style.marginTop = state.position.y+"px";
                elem.style.marginLeft = state.position.x+"px";
            }
        }        
    },[store.show,state.position])

    const hideModal=()=>{
        ModalData.contextModal = InitialModalData.contextModal;
        dispatch(ActionModals.hideModal(EnumModals.CONTEXT));
    }    

    useEffect(()=>{
        const modalOpenEventListener = ()=>{        
            setState({position:ModalData.contextModal.position});
            dispatch(ActionModals.showModal(EnumModals.CONTEXT));
        }

        UiUtils.openContextModal = modalOpenEventListener;        

        document.addEventListener("click",(e)=>{
            if(refData.current.show && !refData.current.onHover){
                hideModal();
            }
        });        

    },[])

    const handleClick = (item:IContextItem)=>{
        item.onClick();
        hideModal();
    }
    
    return (
        <Modal dialogClassName="context" className="context-modal" backdrop={false}  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body onMouseEnter={()=> {refData.current.onHover = true}} onMouseLeave={()=>{refData.current.onHover = false}}>
                <div className="container">                    
                    {!!Data.items.length && Data.items.map(item=>(
                        <div key={item.text} className={`row g-0 border-bottom context-option`}>
                            <div className="col-12 hover cur-default overflow-ellipsis text-nowrap" onClick={() => handleClick(item)} style={{maxWidth:500}}>
                                {item.text} {!!item.icon && item.icon}
                            </div> 
                        </div>
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const ContextModal = React.memo(ContextModalComponent);