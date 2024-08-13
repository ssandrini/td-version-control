import React from "react";
import {Button} from "../../components/ui/button.tsx";

interface SidebarProps {
    setPath: (_: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({setPath}) => {

    const handleFilePick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            console.log(files);
            setPath(files.filePaths[0]);
        })
    }

    const handleNewProject = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            console.log(files);
            setPath(files.filePaths[0]);
        })
    }

    return (
        <div className="flex flex-col gap-3">
            <Button onClick={handleFilePick}>Elegi el path</Button>
            <Button onClick={handleNewProject}>Crea un proyecto</Button>
        </div>
    )
}

export default Sidebar;