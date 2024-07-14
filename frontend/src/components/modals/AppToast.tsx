import { useEffect } from 'react';
import { Toast } from 'react-bootstrap';
import { shallowEqual, useDispatch } from 'react-redux';
import { InitialModalData, ModalData } from './ModalData';
import { useSelectorTyped } from '../../store/rootReducer';
import { EnumModals } from '../../lib';
import { ActionModals } from '../../store';
import React from 'react';


function AppToastComponent(){
    const dispatch = useDispatch();
    const store = useSelectorTyped(state=>({
        show:state.modal.openedModals.includes(EnumModals.TOAST),
    }),shallowEqual)
    useEffect(()=>{
        if(!store.show) ModalData.appToast = InitialModalData.appToast;
    },[store.show])
    const closeToast=()=>{
        dispatch(ActionModals.hideModal(EnumModals.TOAST));
    }
    useEffect(()=>{
        dispatch(ActionModals.showModal(EnumModals.TOAST));
    },[])
    return (
        <Toast onClose={closeToast} show={store.show} delay={3000} autohide animation 
          className={`appToast position-absolute bg-success text-center ${ModalData.appToast.customClass?ModalData.appToast.customClass:''}`}>
         {ModalData.appToast.title && <Toast.Header>
             <strong className="mr-auto">{ModalData.appToast.title}</strong>
          </Toast.Header>}
          <Toast.Body>
            <p className="mb-0 ">{ ModalData.appToast.message}</p>
          </Toast.Body>
        </Toast>
    )
}

export const AppToast = React.memo(AppToastComponent);