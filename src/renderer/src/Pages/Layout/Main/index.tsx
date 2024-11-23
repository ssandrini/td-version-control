import React from 'react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { localPaths } from '../../../const';
import { FaCog, FaFolderOpen } from 'react-icons/fa';
import './index.css';
import Projects from '../../Projects/Projects';

const Main: React.FC = () => {
    return (
        <div className="flex flex-col items-center pt-10 text-white overflow-y-auto no-scrollbar">
            <div className="flex flex-row items-center justify-center w-full gap-10">
                <Link
                    to={localPaths.PROJECTS}
                    className={cn(
                        'flex items-center py-2',
                        'justify-center',
                        'rounded-full border px-3 hover:bg-gray-600 hover:bg-opacity-40'
                    )}
                >
                    <FaFolderOpen className={cn('text-xl mr-3')} />
                    All Projects
                </Link>
                <Link
                    to={localPaths.SETTINGS}
                    className={cn(
                        'flex items-center py-2',
                        'justify-center',
                        'rounded-full border px-3 hover:bg-gray-600 hover:bg-opacity-40'
                    )}
                >
                    <FaCog className={cn('text-xl mr-3')} />
                    Settings
                </Link>
            </div>

            <div className="w-full flex flex-col no-scrollbar">
                <Projects hideHeader={true} />
            </div>
        </div>
    );
};

export default Main;
