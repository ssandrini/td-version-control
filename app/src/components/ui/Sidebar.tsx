import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {FaCog, FaFolderOpen, FaHome} from 'react-icons/fa';
import {cn} from "../../lib/utils";

const Sidebar: React.FC = () => {
    const [expanded] = useState(false);

    const [selected, setSelected] = useState<string>('/');

    return (<div
        className={cn(expanded ? "w-60" : "w-16", "transition-all overflow-hidden duration-600 ease-in-out h-full bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-700 overflow-y-auto sticky items-top")}
    >
        <div className="flex items-center pl-2.5 h-16 border-b border-gray-700">
            <img src="public/img.png" alt="" className="w-11 h-11 rounded-full"/>
            {expanded && (
                <h1 className="text-xl font-semibold ml-2 transition-all duration-600 ease-in-out">Mariana</h1>)}
        </div>
        <div className={cn("flex p-2 flex-col space-y-4 items-center justify-center w-full")}>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == '/' ? "bg-gray-600" : "")}>
                <Link to="/" onClick={() => setSelected('/')}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaHome className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Home")}
                </Link>
            </div>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == '/projects' ? "bg-gray-600" : "")}>
                <Link to="/projects" onClick={() => setSelected('/projects')}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaFolderOpen className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Projects")}
                </Link>
            </div>
            <div
                className={cn(!expanded ? "h-10 flex items-center justify-center" : "", "rounded hover:bg-gray-700 w-full", selected == '/settings' ? "bg-gray-600" : "")}>
                <Link to="/settings" onClick={() => setSelected('/settings')}
                      className={cn("flex items-center py-2", expanded ? "px-4" : "justify-center")}>
                    <FaCog className={cn("text-xl", expanded ? "mr-3" : "")}/>
                    {expanded && ("Settings")}
                </Link>
            </div>
        </div>
    </div>);
};

export default Sidebar;
