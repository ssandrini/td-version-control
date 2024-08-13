import React from 'react';
import Sidebar from "../../components/ui/Sidebar";
import { FaUserCircle } from 'react-icons/fa'; // Ícono para la foto de perfil

const Profile: React.FC = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <main className="flex-1 bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center space-x-6">
                        {/* Foto de Perfil */}
                        <div className="w-32 h-32 flex-shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-6xl">
                                <FaUserCircle />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-800">John Doe</h1>
                            <p className="text-gray-600 mt-1">john.doe@example.com</p>
                            <p className="text-gray-600 mt-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, nisl vitae
                                viverra tincidunt, sapien lorem cursus est, eu consectetur purus eros nec mi.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
