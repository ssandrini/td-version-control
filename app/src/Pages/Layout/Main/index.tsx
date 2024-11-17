import React from 'react';
import {cn} from "../../../lib/utils";
import {Link} from "react-router-dom";
import {localPaths} from "../../../const";
import {FaCog, FaFolderOpen} from "react-icons/fa";
import './index.css';
import Projects from "../../Projects/Projects";
import MarianaHelper from "../../../components/ui/MarianaHelper";

const Main: React.FC = () => {

    return (<div
        className="flex flex-col items-center pt-10 h-screen bg-gradient-to-r from-blue-950 to-blue-900 text-white overflow-y-auto">
        <MarianaHelper/>
        <div className="flex flex-row items-center justify-center w-full gap-10 mt-10">
            <Link to={localPaths.PROJECTS}
                  className={cn("flex items-center py-2", "justify-center", "rounded-full border px-3 hover:bg-gray-600 hover:bg-opacity-40")}>
                <FaFolderOpen className={cn("text-xl mr-3")}/>
                All Projects
            </Link>
            <Link to={localPaths.SETTINGS}
                  className={cn("flex items-center py-2", "justify-center", "rounded-full border px-3 hover:bg-gray-600 hover:bg-opacity-40")}>
                <FaCog className={cn("text-xl mr-3")}/>
                Settings
            </Link>
        </div>

        <div className="w-full flex flex-col">
            <h2 className="pl-10 font-bold">
                {/* TODO: Add recent projects to back */}
                Recently opened:
            </h2>
            <Projects hideHeader={true}/>
        </div>
    </div>);
};

export default Main;
