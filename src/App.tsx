import React from 'react';
import './App.css';
import Main from "./Pages/Layout/Main";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Profile from './Pages/Profile/Profile';
import ProjectDetail from './Pages/ProjectDetails/ProjectDetails';
import Layout from "./Pages/Layout";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout />} >
                    <Route path="" element={<Main />} />
                    <Route path='projects' element={<Projects />} />
                    <Route path='profile' element={<Profile />} />
                    <Route path='projects' element={<ProjectDetail />} /> {/* Ruta para el detalle del proyecto */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
