import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import StoreContextProvider from './Components/Context/storeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <StoreContextProvider>
      <App />
      <ToastContainer />
    </StoreContextProvider>
  </Router>
);



