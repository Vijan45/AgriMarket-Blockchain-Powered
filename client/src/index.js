import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Self-debugging mechanism for environment variables
const checkEnvVariables = () => {
    const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

    console.log('Pinata API Key loaded:', pinataApiKey ? 'Available' : 'Not Available');
    console.log('Pinata Secret API Key loaded:', pinataSecretApiKey ? 'Available' : 'Not Available');
};

// Invoke the debugging check without affecting the app rendering
checkEnvVariables();

// Create a root and render the App component
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
