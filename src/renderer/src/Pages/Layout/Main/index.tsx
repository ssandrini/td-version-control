import React, { useState } from 'react';
import './index.css';
import Projects from '../../Projects/Projects';
import { localPaths } from '@renderer/const';
import { useNavigate } from 'react-router-dom';
import { Button } from '@renderer/components/ui/button';

const Main: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateNewProject = () => {
        navigate(localPaths.HOME + localPaths.NEW_PROJECT);
    };

    const [hasProjects, setHasProjects] = useState<boolean>(false);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full pt-10 text-white overflow-y-auto no-scrollbar">
            <div className="w-full px-10 mb-10">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Simplify Your TouchDesigner Workflow
                    </h1>
                    <p className="text-lg mb-8 max-w-2xl">
                        Seamlessly manage and version-control your TouchDesigner projects with our
                        intuitive VCS tool designed specifically for creators like you.
                    </p>
                    <Button
                        onClick={handleCreateNewProject}
                        className="bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
                    >
                        Start a new project
                    </Button>
                </div>
            </div>
            <div className={!hasProjects ? 'hidden w-full h-full' : 'w-full h-full'}>
                <div className="w-full px-28">
                    <div className="w-full border-[0.2rem] bg-gray-700 border-gray-700 rounded-full" />
                </div>
                <Projects hideHeader={true} ignoreRemote setHasProjects={setHasProjects} />
            </div>
        </div>
    );
};

export default Main;
