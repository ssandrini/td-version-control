import React from 'react';
import './App.css';
import Main from "./Pages/Layout/Main";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Profile from './Pages/Profile/Profile';
import ProjectDetail from './Pages/ProjectDetails/ProjectDetails';
import Layout from "./Pages/Layout";
import {VariableProvider} from "./hooks/Variables/useVariableContext.tsx";

const App: React.FC = () => {
    return (<VariableProvider>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout/>}>
                    <Route path="" element={<Main/>}/>
                    <Route path='projects' element={<Projects/>}/>
                    <Route path='profile' element={<Profile/>}/>
                    <Route path='projects' element={<ProjectDetail/>}/> {/* Ruta para el detalle del proyecto */}
                </Route>
            </Routes>
        </BrowserRouter>
    </VariableProvider>);
}

export default App;
