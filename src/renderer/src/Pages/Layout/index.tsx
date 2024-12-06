import React, { useEffect, useState } from 'react';
import { useVariableContext } from '../../hooks/Variables/useVariableContext';
import { Outlet } from 'react-router-dom';
import LogIn from './LogIn';
import Spinner from '../../components/ui/Spinner';
import { ApiResponse } from '../../../../main/errors/ApiResponse';
import { User } from '../../../../main/models/api/User';
import Sidebar from '@renderer/components/ui/Sidebar';
import { HiMenuAlt1 } from 'react-icons/hi';
import RegisterPage from '@renderer/Pages/RegisterPage';
import { FaRegWindowMaximize, FaRegWindowMinimize, FaWindowClose } from 'react-icons/fa';
import { ProjectDependencies } from '@renderer/models/ProjectDependencies';
import MissingDependenciesDialog from '@renderer/components/ui/MissingDependenciesDialog';
import { AnimatePresence, motion } from 'framer-motion';

const Layout: React.FC = () => {
    const {
        hasMissingDependencies,
        missingDependencies,
        setMissingDependencies,
        user,
        setUser,
        setDefaultProjectLocation
    } = useVariableContext();
    const [userStateReady, setUserStateReady] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);

    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .getUser()
            .then((response: ApiResponse<User>) => {
                if (response.errorCode) {
                    setUser(undefined);
                } else {
                    setUser(response.result!);
                }
            })
            .finally(() => {
                setUserStateReady(true);
            });
    }, []);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.checkDependencies().then((missingDeps: ProjectDependencies[]) => {
            setMissingDependencies(missingDeps);
        });
    }, []);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getDefaultProjectsFolder().then((path: string) => {
            if (path) {
                setDefaultProjectLocation(path);
            }
        });
    }, [setDefaultProjectLocation]);

    const recheckDependencies = async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const missingDeps = await window.api.checkDependencies();
        setMissingDependencies(missingDeps);
    };

    return (
        <div className="h-screen bg-[#1b1d23]">
            <div className="topBar w-full justify-between items-center flex flex-row">
                {user != undefined ? (
                    <div className="toggleButton flex flex-col justify-start text-white h-10 w-[6rem]">
                        <HiMenuAlt1
                            id="showHideMenu"
                            className="cursor-pointer h-10 w-fit"
                            onClick={() => setExpanded(!expanded)}
                        />
                    </div>
                ) : (
                    <div className="w-[6rem]" />
                )}
                <div className="flex flex-row titleBar items-center w-full justify-center">
                    <img className="topBarMainImg rounded-full mt-1" src="icon.png" alt="" />
                    <div className="title font-bold">Mariana</div>
                </div>
                <div className="titleBarButtons w-[6rem]">
                    <button
                        id="minimizeBtn"
                        className="topBtn minimizeBtn text-white"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.minimizeApp();
                        }}
                        title="Minimize"
                    >
                        <FaRegWindowMinimize />
                    </button>
                    <button
                        id="maxResBtn"
                        className="topBtn maximizeBtn text-white"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.maximizeRestoreApp();
                        }}
                        title="Maximize"
                    >
                        <FaRegWindowMaximize />
                    </button>
                    <button
                        id="closeBtn"
                        className="topBtn closeBtn text-red-600"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.closeApp();
                        }}
                        title="Close"
                    >
                        <FaWindowClose />
                    </button>
                </div>
            </div>

            {hasMissingDependencies() && user != undefined && (
                <div className="fixed inset-0 z-10 bg-[#1b1d23] bg-opacity-10 backdrop-blur-sm flex items-center justify-center">
                    <MissingDependenciesDialog
                        missingDependencies={missingDependencies}
                        onRecheck={recheckDependencies}
                    />
                </div>
            )}
            <div id="mySideBar" className="leftMenu"></div>
            {!userStateReady ? (
                <div className="flex flex-col pb-[50px] h-full items-center justify-evenly pt-10 bg-[#1b1d23] text-white overflow-y-auto">
                    <Spinner white />
                </div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        {user == undefined ? (
                            <>
                                {showRegister ? (
                                    <RegisterPage goToLogin={() => setShowRegister(false)} />
                                ) : (
                                    <LogIn goToRegister={() => setShowRegister(true)} />
                                )}
                            </>
                        ) : (
                            <div className="h-full pb-[35px] flex flex-row flex-1 overflow-auto">
                                <Sidebar expanded={expanded} />
                                <motion.div
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full overflow-auto no-scrollbar bg-[#1b1d23]"
                                >
                                    <Outlet />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default Layout;
