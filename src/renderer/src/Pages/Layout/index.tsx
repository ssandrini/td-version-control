import React, { useEffect, useState } from 'react';
import { useVariableContext } from '../../hooks/Variables/useVariableContext';
import { Outlet } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import log from 'electron-log/renderer.js';
import LogIn from './LogIn';
import MarianaHelper from '../../components/ui/MarianaHelper';
import Spinner from '../../components/ui/Spinner';
import { ApiResponse } from '../../../../main/errors/ApiResponse';
import { User } from '../../../../main/models/api/User';
import Sidebar from '@renderer/components/ui/Sidebar';
import { HiMenuAlt1 } from 'react-icons/hi';

const Layout: React.FC = () => {
    const { hasTDL, setTouchDesignerLocation, user, setUser } = useVariableContext();
    const [userStateReady, setUserStateReady] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);

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
        window.api.getTDBinPath().then((path: string) => {
            if (path) {
                setTouchDesignerLocation(path);
            }
        });
    }, [setTouchDesignerLocation]);

    const handleSetLocation = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const files = await window.api.filePicker();

            if (files.filePaths.length > 0) {
                const selectedPath = files.filePaths[0];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                await window.api.saveTDBinPath(selectedPath);
                setTouchDesignerLocation(selectedPath);
            } else {
                log.info('No file was selected.');
            }
        } catch (error) {
            log.error('Error selecting file:', error);
        }
    };

    return (
        <div className="h-screen">
            <div className="topBar w-full justify-between items-center flex flex-row">
                {user != undefined ? (
                    <HiMenuAlt1
                        id="showHideMenu"
                        className="toggleButton text-white h-10 w-10 cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    />
                ) : (
                    <div />
                )}
                <div className="flex flex-row titleBar w-full justify-center">
                    <img className="topBarMainImg rounded-full" src="icon.png" alt="" />
                    <div className="title font-bold">Mariana</div>
                </div>
                <div className="titleBarButtons">
                    <button
                        id="minimizeBtn"
                        className="topBtn minimizeBtn"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.minimizeApp();
                        }}
                        title="Minimize"
                    ></button>
                    <button
                        id="maxResBtn"
                        className="topBtn maximizeBtn"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.maximizeRestoreApp();
                        }}
                        title="Maximize"
                    ></button>
                    <button
                        id="closeBtn"
                        className="topBtn closeBtn"
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.closeApp();
                        }}
                        title="Restore"
                    ></button>
                </div>
            </div>

            {!hasTDL() && user != undefined && (
                <div>
                    <Dialog open>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Select location of TouchDesigner</DialogTitle>
                                <DialogDescription>
                                    In order to use the tool correctly, please select TouchDesigner
                                    location.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="button" onClick={handleSetLocation}>
                                    Select location
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <div id="mySideBar" className="leftMenu"></div>
            {!userStateReady ? (
                <div className="flex flex-col pb-[50px] h-full items-center justify-evenly pt-10 bg-[#1b1d23] text-white overflow-y-auto">
                    <MarianaHelper />
                    <Spinner white />
                </div>
            ) : (
                <>
                    {user == undefined ? (
                        <LogIn />
                    ) : (
                        <div className="h-full pb-[50px] flex flex-row flex-1 overflow-auto">
                            <Sidebar expanded={expanded} />
                            <div className="w-full overflow-auto no-scrollbar bg-[#1b1d23]">
                                <Outlet />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Layout;
