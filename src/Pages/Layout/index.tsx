import React, {useEffect} from 'react'
import {useVariableContext} from "../../hooks/Variables/useVariableContext.tsx";
import Sidebar from "../../components/ui/Sidebar.tsx";
import {Outlet} from "react-router-dom";
import {
    Dialog,
    DialogFooter,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../../components/ui/dialog.tsx";
import {Button} from "../../components/ui/button.tsx";


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

    const handleSetLocation = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.saveTDBinPath(selectedPath);
            setTouchDesignerLocation(selectedPath);
        });
    }

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
                        <Button type="button" onClick={handleSetLocation}>Buscar ubicaccion</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>)}
        <div className="flex h-screen">
            <div className="min-w-40 max-w-40 h-full">
                <Sidebar/>
            </div>
            <div className="w-full h-screen">
                <Outlet/>
            </div>
        </div>
    </>);
};

export default Layout