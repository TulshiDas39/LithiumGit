import React, { useState } from 'react';
import { useEffect } from 'react';
//import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { Layout } from './components/layouts/layout';

function App() {
  const [start,setState] = useState(false);

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
