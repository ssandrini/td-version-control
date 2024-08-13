import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import History from '../Main/History';

const ProjectDetail: React.FC = () => {
    const { projectName } = useParams<{ projectName: string }>();
    const location = useLocation();
    const path = location.state?.path; // Accede al path pasado en el estado

    return (
        <div className="flex h-screen">
            <Sidebar />

            <main className="flex-1 bg-gray-100 p-8">
                <div className="p-8 text-white bg-gray-900">
                    <h1 className="text-4xl font-semibold mb-4">Project: {projectName}</h1>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-2xl font-semibold mb-2">Details</h2>
                        <History path={path}/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectDetail;
