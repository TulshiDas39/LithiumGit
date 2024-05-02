import { MainEvents, RendererEvents } from 'common_library';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layouts/layout';
import { EnumModals, ReduxUtils, useMultiState } from './lib';
import { UiConstants } from './lib/constants';
import { ActionUI } from './store/slices/UiSlice';
import { IpcUtils } from './lib/utils/IpcUtils';
import { ActionModals } from './store';
import { ModalData } from './components/modals/ModalData';

interface IState{
  isInitialised:boolean;
}

function App() {
  const [state,setState] = useMultiState<IState>({isInitialised:false});

  const dispatch = useDispatch();
  IpcUtils.showError = (err:string)=>{
    ModalData.errorModal.message = err;
    dispatch(ActionModals.showModal(EnumModals.ERROR));
  };
  ReduxUtils.dispatch = dispatch;
  useEffect(()=>{
    if(!window.ipcRenderer) return;
    window.ipcRenderer.on(RendererEvents.logger,(e,data:any)=>{
    })
    window.ipcRenderer.on(MainEvents.AppFocused,(_)=>{      
      dispatch(ActionUI.increamentVersion("appFocused"));
    })
  },[window.ipcRenderer])

  useEffect(()=>{
    UiConstants.screenHeight = window.innerHeight;
    UiConstants.screenWidth = window.innerWidth;
    setState({isInitialised:true});
  },[])

  if(!window.ipcRenderer || !state.isInitialised){
    return <div></div>;
  }

  return (
    <BrowserRouter>
        <Layout height={UiConstants.screenHeight} />
    </BrowserRouter>
  );
}

export default App;
