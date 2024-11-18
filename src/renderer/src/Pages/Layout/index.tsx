import React, {useEffect, useState} from 'react'
import {useVariableContext} from "../../hooks/Variables/useVariableContext";
import {Outlet} from "react-router-dom";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../components/ui/dialog";
import {Button} from "../../components/ui/button";
import log from 'electron-log/renderer.js';
import LogIn from "./LogIn";
import MarianaHelper from "../../components/ui/MarianaHelper";
import Spinner from "../../components/ui/Spinner";
import {ApiResponse} from "../../../../main/errors/ApiResponse";
import {User} from "../../../../main/models/api/User"


const Layout: React.FC = () => {
    const {hasTDL, setTouchDesignerLocation, user, setUser} = useVariableContext();
    const [userStateReady, setUserStateReady] = useState<boolean>(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getUser().then((response: ApiResponse<User>) => {
            if(response.errorCode) {
                setUser(undefined);
            } else {
                setUser(response.result!);
            }
        }).finally(() => {
            setUserStateReady(true)
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
                log.info("No file was selected.");
            }
        } catch (error) {
            log.error("Error selecting file:", error);
        }
    };

    return (<>
        {!hasTDL() && (user != undefined) && (<div>
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
            {user == undefined ? (<LogIn/>) : (<Outlet/>)}
        </>)}
    </>);
};

export default Layout;
