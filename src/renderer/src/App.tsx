import React from 'react';
import './App.css';
import Main from './Pages/Layout/Main';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Projects from './Pages/Projects/Projects';
import Settings from './Pages/Settings/Settings';
import ProjectDetail from './Pages/ProjectDetails/ProjectDetails';
import Layout from './Pages/Layout';
import { VariableProvider } from './hooks/Variables/useVariableContext';
import { localPaths } from './const';
import NewProject from './Pages/NewProject/NewProjects';

const App: React.FC = () => {
    return (
        <VariableProvider>
            <HashRouter>
                <Routes>
                    <Route path={localPaths.HOME} element={<Layout />}>
                        <Route path="" element={<Main />} />
                        <Route path={localPaths.PROJECTS} element={<Projects />} />
                        <Route path={localPaths.SETTINGS} element={<Settings />} />
                        <Route path={localPaths.PROJECT_DETAIL} element={<ProjectDetail />} />
                        <Route path={localPaths.NEW_PROJECT} element={<NewProject />} />
                    </Route>
                </Routes>
            </HashRouter>
        </VariableProvider>
    );
};

export default App;
