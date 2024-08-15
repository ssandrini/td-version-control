import React from 'react';
import './App.css';
import Main from "./Pages/Layout/Main";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Settings from './Pages/Settings/Settings.tsx';
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
                    <Route path='settings' element={<Settings/>}/>
                    <Route path='/projects/:projectName' element={<ProjectDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </VariableProvider>);
}

export default App;
