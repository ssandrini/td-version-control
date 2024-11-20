import React from 'react';
import Sidebar from '../../components/ui/Sidebar';
import { Outlet } from 'react-router-dom';

const InnerLayout: React.FC = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="w-full h-screen overflow-auto no-scrollbar bg-gray-900">
                <Outlet />
            </div>
        </div>
    );
};

export default InnerLayout;
