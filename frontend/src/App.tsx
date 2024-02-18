import { MainEvents, RendererEvents } from 'common_library';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layouts/layout';
import { useMultiState } from './lib';
import { UiConstants } from './lib/constants';
import { ActionUI } from './store/slices/UiSlice';

interface IState{
  isInitialised:boolean;
}

function App() {
  const [state,setState] = useMultiState<IState>({isInitialised:false});

  const dispatch = useDispatch();
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
