import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaFolderOpen, FaCog } from 'react-icons/fa'; // Actualizado el ícono

const Sidebar: React.FC = () => {
    return (
        <div className="h-full bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <h1 className="text-xl font-semibold">Mariana</h1>
            </div>
            <div className="flex-1 p-4">
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                            <FaHome className="text-xl mr-3" />
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/projects" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                            <FaFolderOpen className="text-xl mr-3" />
                            Projects
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                            <FaCog className="text-xl mr-3" />
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
