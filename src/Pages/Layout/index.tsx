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

    }, [])

    const handleSetLocation = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
            setTouchDesignerLocation(selectedPath);
        });
    }

    return (<>
        {!hasTDL() && (<div>
            <Dialog open>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Indicar ubicaccion de TouchDesigner</DialogTitle>
                        <DialogDescription>
                            Para poder utilizar correctamente la herramienta por favor selecciona la ubicacion de touch designer.
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
