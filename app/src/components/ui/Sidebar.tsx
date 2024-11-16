import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {FaCog, FaFolderOpen, FaHome} from 'react-icons/fa';
import {cn} from "../../lib/utils";
import {localPaths} from "../../const";
import {useVariableContext} from "../../hooks/Variables/useVariableContext";
import {CiLogout} from "react-icons/ci";

const Sidebar: React.FC = () => {
    const {setUser} = useVariableContext();

    const [expanded] = useState(false);
    const url = new URL(window.location.href).pathname.split('/')[1];
    const [selected, setSelected] = useState<string>(url);

    useEffect(() => {
        const url = new URL(window.location.href).pathname.split('/')[1];
        setSelected(url);
    }, [window]);

    return (<div
        className={cn(expanded ? "w-60" : "w-16", "transition-all overflow-hidden duration-600 ease-in-out h-full bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-700 overflow-y-auto sticky items-top")}
    >
        <div className="flex items-center pl-2.5 h-16 border-b border-gray-700">
            <img src="public/img.png" alt="" className="w-11 h-11 rounded-full"/>
            {expanded && (
                <h1 className="text-xl font-semibold ml-2 transition-all duration-600 ease-in-out">Mariana</h1>)}
        </div>
        <div className={cn("flex p-2 flex-col space-y-4 items-center justify-start w-full h-full")}>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == localPaths.HOME ? "bg-gray-600" : "")}>
                <Link to={localPaths.HOME} onClick={() => setSelected(localPaths.HOME)}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaHome className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Home")}
                </Link>
            </div>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == localPaths.PROJECTS ? "bg-gray-600" : "")}>
                <Link to={localPaths.HOME + localPaths.PROJECTS} onClick={() => setSelected(localPaths.PROJECTS)}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaFolderOpen className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Projects")}
                </Link>
            </div>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == localPaths.SETTINGS ? "bg-gray-600" : "")}>
                <Link to={localPaths.HOME + localPaths.SETTINGS} onClick={() => setSelected(localPaths.SETTINGS)}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaCog className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Settings")}
                </Link>
            </div>
            <div className="flex h-full w-full">
                <div
                    className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "text-red mt-auto", "rounded hover:bg-red-600 hover:bg-opacity-40 w-full")}>
                    <div onClick={() => setUser(undefined)}
                          className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                        <CiLogout className={cn("text-xl text-red-600 font-bold", expanded ? "mr-3" : "")}/>
                        {expanded && ("Log Out")}
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default Sidebar;
