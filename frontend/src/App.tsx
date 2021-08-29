import { RendererEvents } from 'common_library';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './components/layouts/layout';

function App() {
  
  useEffect(()=>{
    if(!window.ipcRenderer) return;
    window.ipcRenderer.on(RendererEvents.logger,(e,data:any)=>{
      console.log("logger", data);
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
