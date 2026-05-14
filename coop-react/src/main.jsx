import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App.jsx';
import api from './api/axios.jsx';
import { setupGlobalNetworkActivity } from './utils/networkActivity';

setupGlobalNetworkActivity([axios, api]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
