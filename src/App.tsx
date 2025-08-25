import React from 'react';
import './App.scss';
import {ToastContainer} from 'react-toastify';
import {Navigation} from './routes';
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from './context';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navigation/>
                <ToastContainer position="bottom-center"
                                autoClose={5000}
                                hideProgressBar
                                newestOnTop
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
