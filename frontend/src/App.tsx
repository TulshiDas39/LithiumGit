import { MainEvents, RendererEvents } from 'common_library';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layouts/layout';
import { ActionUI } from './store/slices/UiSlice';

function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    if(!window.ipcRenderer) return;
    window.ipcRenderer.on(RendererEvents.logger,(e,data:any)=>{
      console.log("logger", data);
    })
    window.ipcRenderer.on(MainEvents.AppFocused,(_)=>{
      console.log('app focussed');
      dispatch(ActionUI.increamentVersion("appFocused"));
    })
  },[window.ipcRenderer])

  if(!window.ipcRenderer){
    return <div></div>;
  }
  return (
    <BrowserRouter>
        <Layout />
    </BrowserRouter>
  );
}

export default App;
