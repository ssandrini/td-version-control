import React from 'react'
import Sidebar from '../../components/ui/Sidebar';
// import History from "./History";
// import Sidebar from "../Sidebar";


const Main: React.FC = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <main className="flex-1 bg-gray-100 p-8">
                <div className="flex items-center justify-center h-full">
                    <h2 className="text-2xl text-gray-700">Welcome to the Main Page</h2>
                </div>
            </main>
        </div>
    );
};

export default Main
