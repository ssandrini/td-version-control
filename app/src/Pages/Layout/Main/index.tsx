import React, {useState} from 'react';
import {cn} from "../../../lib/utils";
import {Link} from "react-router-dom";
import {localPaths} from "../../../const";
import {FaCog, FaFolderOpen} from "react-icons/fa";
import './index.css';
import Projects from "../../Projects/Projects";

const Main: React.FC = () => {
    const [showMiddleDiv, setShowMiddleDiv] = useState(false);

    return (<div
        className="flex flex-col items-center pt-10 h-screen bg-gradient-to-r from-blue-950 to-blue-900 text-white overflow-y-auto">
        <div className="flex flex-col bg-gradient-to-r from-blue-900 to-blue-950 border border-white p-10 rounded-[2rem] gap-4 justify-between">
            <div className="text-center cursor-pointer" onClick={() => setShowMiddleDiv(!showMiddleDiv)}>
                <div className="flex flex-row w-full items-center justify-center gap-3 mb-4">
                    <img src="public/img.png" alt="" className="w-14 h-14 rounded-lg"/>
                    <h1 className="text-6xl font-bold">Mariana</h1>
                </div>
                <div className="max-w-lg mx-auto">
                    <p className="text-xl text-gray-300">
                        A version control system designed specifically for TouchDesigner projects.
                    </p>
                </div>
            </div>

            {showMiddleDiv && (<div className="flex justify-center space-x-16">
                    <div className="text-center animate-fade-in-up delay-300">
                        <div className="flex justify-center mb-4">
                            <img src="public/capture.png" alt="Capture icon" className="w-16 h-16"/>
                        </div>
                        <h3 className="text-3xl font-bold">Capture</h3>
                        <p className="text-sm mt-2 text-gray-300">every step of your creative process.</p>
                    </div>
                    <div className="text-center animate-fade-in-up delay-600">
                        <div className="flex justify-center mb-4">
                            <img src="public/recover.png" alt="Recover icon" className="w-16 h-16"/>
                        </div>
                        <h3 className="text-3xl font-bold">Recover</h3>
                        <p className="text-sm mt-2 text-gray-300">any previous version</p>
                    </div>
                    <div className="text-center animate-fade-in-up delay-900">
                        <div className="flex justify-center mb-4">
                            <img src="public/refine.png" alt="Refine icon" className="w-16 h-16"/>
                        </div>
                        <h3 className="text-3xl font-bold">Refine</h3>
                        <p className="text-sm mt-2 text-gray-300">and improve with confidence.</p>
                    </div>
                </div>)}
        </div>

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
