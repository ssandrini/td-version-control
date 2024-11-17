import React, {useEffect, useState} from 'react'
import {useVariableContext} from "../../hooks/Variables/useVariableContext.tsx";
import {Outlet} from "react-router-dom";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../components/ui/dialog.tsx";
import {Button} from "../../components/ui/button.tsx";
import log from 'electron-log/renderer';
import LogIn from "./LogIn";
import MarianaHelper from "../../components/ui/MarianaHelper";
import Spinner from "../../components/ui/Spinner";


const Layout: React.FC = () => {
    const {hasTDL, setTouchDesignerLocation, isLoggedIn, user, setUser} = useVariableContext();
    const [showLogin, setShowLogin] = useState<boolean>(!isLoggedIn());
    const [userStateReady, setUserStateReady] = useState<boolean>(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getUser().then((user) => {
            setUser(user);
            setShowLogin(false);
        }).catch(() => {
            setUser(undefined);
            setShowLogin(true);
        }).finally(() => {
            setUserStateReady(true)
        });
    }, []);

    useEffect(() => {
        setShowLogin(!isLoggedIn());
    }, [isLoggedIn, user]);

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
                log.info("No file was selected.");
            }
        } catch (error) {
            log.error("Error selecting file:", error);
        }
    };

    return (<>
        {!hasTDL() && !showLogin && (<div>
            <Dialog open>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select location of TouchDesigner</DialogTitle>
                        <DialogDescription>
                            In order to use the tool correctly, please select TouchDesigner location.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" onClick={handleSetLocation}>Select location</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>)}
        {!userStateReady ? (<div
            className="flex flex-col items-center justify-evenly pt-10 h-screen bg-gradient-to-r from-blue-950 to-blue-900 text-white overflow-y-auto">
            <MarianaHelper/>
            <Spinner/>
        </div>) : (<>
            {showLogin ? (<LogIn/>) : (<Outlet/>)}
        </>)}
    </>);
};

export default Layout;
