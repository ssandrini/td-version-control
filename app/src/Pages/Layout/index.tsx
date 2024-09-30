import React, {useEffect} from 'react'
import {useVariableContext} from "../../hooks/Variables/useVariableContext.tsx";
import Sidebar from "../../components/ui/Sidebar.tsx";
import {Outlet} from "react-router-dom";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../components/ui/dialog.tsx";
import {Button} from "../../components/ui/button.tsx";
import log from 'electron-log/renderer';


const Layout: React.FC = () => {
    const {hasTDL, setTouchDesignerLocation} = useVariableContext();

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
        {!hasTDL() && (<div>
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
        <div className="flex h-screen">
            <Sidebar/>
            <div className="w-full h-screen overflow-auto">
                <Outlet/>
            </div>
        </div>
    </>);
};

export default Layout
