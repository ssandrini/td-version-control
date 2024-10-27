import React from 'react';
import './App.css';
import Main from "./Pages/Layout/Main";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Settings from './Pages/Settings/Settings.tsx';
import ProjectDetail from './Pages/ProjectDetails/ProjectDetails';
import Layout from "./Pages/Layout";
import {VariableProvider} from "./hooks/Variables/useVariableContext.tsx";
import {localPaths} from "./const";
import NewProject from './Pages/NewProject/NewProjects.tsx';
import InnerLayout from "./Pages/InnerLayout";

const App: React.FC = () => {
    return (<VariableProvider>
        <BrowserRouter>
            <Routes>
                <Route path={localPaths.HOME} element={<Layout/>}>
                    <Route path="" element={<Main/>}/>
                    <Route path={localPaths.PROJECTS} element={<InnerLayout/>}>
                        <Route path="" element={<Projects/>}/>
                    </Route>
                    <Route path={localPaths.SETTINGS} element={<InnerLayout/>}>
                        <Route path="" element={<Settings/>}/>
                    </Route>
                    <Route path={localPaths.PROJECT_DETAIL} element={<InnerLayout />} >
                        <Route path="" element={<ProjectDetail/>}/>
                    </Route>
                    <Route path={localPaths.NEW_PROJECT} element={<InnerLayout/>} >
                        <Route path="" element={<NewProject/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </VariableProvider>);
}

export default App;
