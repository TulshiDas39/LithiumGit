import React, { useState } from 'react';
//import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import { Layout } from './components/layouts/layout';

function App() {
  return (
    <BrowserRouter>
        <Layout />
    </BrowserRouter>
  );
}

export default App;
