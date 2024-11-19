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
import InnerLayout from './Pages/InnerLayout';

const App: React.FC = () => {
    return (
        <VariableProvider>
            <HashRouter>
                <Routes>
                    <Route path={localPaths.HOME} element={<Layout />}>
                        <Route path="" element={<InnerLayout />}>
                            <Route path="" element={<Main />} />
                        </Route>
                        <Route path={localPaths.PROJECTS} element={<InnerLayout />}>
                            <Route path="" element={<Projects />} />
                        </Route>
                        <Route path={localPaths.SETTINGS} element={<InnerLayout />}>
                            <Route path="" element={<Settings />} />
                        </Route>
                        <Route path={localPaths.PROJECT_DETAIL} element={<InnerLayout />}>
                            <Route path="" element={<ProjectDetail />} />
                        </Route>
                        <Route path={localPaths.NEW_PROJECT} element={<InnerLayout />}>
                            <Route path="" element={<NewProject />} />
                        </Route>
                    </Route>
                </Routes>
            </HashRouter>
        </VariableProvider>
    );
};

export default App;
