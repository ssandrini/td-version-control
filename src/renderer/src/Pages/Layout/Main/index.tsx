import React, { useState } from 'react';
import './index.css';
import Projects from '../../Projects/Projects';
import { localPaths } from '@renderer/const';
import { useNavigate } from 'react-router-dom';
import { Button } from '@renderer/components/ui/button';
import { motion } from 'framer-motion';

const Main: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateNewProject = () => {
        navigate(localPaths.HOME + localPaths.NEW_PROJECT);
    };

    const [hasProjects, setHasProjects] = useState<boolean>(false);

    const topDivVariants = {
        initial: { opacity: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeIn' } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5, ease: 'easeIn' } }
    };

    return (
        <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center w-full h-full pt-10 text-white overflow-y-auto no-scrollbar"
        >
            <motion.div
                className="w-full px-10 mb-10"
                variants={topDivVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
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
                        className="bg-gradient-to-r via-[rgb(75, 60, 144)] from-[rgb(59,243,197)] to-[rgb(58,42,177)] text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
                    >
                        Start a new project
                    </Button>
                </div>
            </motion.div>

            <div className={!hasProjects ? 'hidden w-full h-full' : 'w-full h-full'}>
                <div className="w-full px-28">
                    <div className="w-full border-[0.2rem] bg-gray-700 border-gray-700 rounded-full" />
                </div>
                <Projects hideHeader={true} ignoreRemote setHasProjects={setHasProjects} />
            </div>
        </motion.div>
    );
};

export default Main;
