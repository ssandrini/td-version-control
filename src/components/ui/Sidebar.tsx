import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaFolderOpen, FaUser } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg border-r border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <h1 className="text-xl font-semibold">Mariana</h1>
            </div>
            <nav className="flex-1 p-4">
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
                        <Link to="/profile" className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
                            <FaUser className="text-xl mr-3" />
                            Profile
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
