import React from 'react';
import './App.css';
import Main from "./Pages/Main";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Profile from './Pages/Profile/Profile';
import ProjectDetail from './Pages/ProjectDetails/ProjectDetails';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Main />} />
                <Route path='/projects' element={<Projects />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/projects/:projectName' element={<ProjectDetail />} /> {/* Ruta para el detalle del proyecto */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
