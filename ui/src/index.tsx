import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import './styles.scss';
import {Provider} from 'react-redux';
import { ReduxStore } from './store';
import { GraphUtils } from './lib';

export {}

const root = ReactDOM.createRoot(document.getElementById('root')!);

GraphUtils.init();
root.render(
  <React.StrictMode>
    <Provider store={ReduxStore}>
      <App />
    </Provider>
    
  </React.StrictMode>  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// declare global {
//   interface Window {
//       ipcRenderer:Electron.IpcRenderer
//   }
// }