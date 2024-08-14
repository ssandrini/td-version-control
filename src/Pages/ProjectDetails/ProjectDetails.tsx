import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import History from '../../components/ui/history';

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const path = location.state?.path; // Accede al path pasado en el estado
    const projectName = location.state?.projectName; // Accede al path pasado en el estado

    const [currentVersion, setCurrentVersion] = useState<string>(''); // Estado para la versión actual
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        // Aquí deberías obtener la versión actual del proyecto. 
        // Esto podría venir de una API o del estado global.
        // Simulación de obtención de versión actual:
        setCurrentVersion('Version 4'); // Ejemplo de versión actual
    }, []);

    const handleAddVersion = () => {
        // Aquí iría la lógica para crear una nueva versión del proyecto y agregarla al historial
        console.log('Nueva versión creada:', {title, description});
    };

    return (<div className="flex h-full">
        <div className="flex-1 bg-gray-100 p-8 flex">
            <div className="p-8 text-white bg-gray-900 flex-1">
                <div className="mb-4">
                    <h1 className="text-4xl font-semibold mb-2">Project: {projectName}</h1>
                    <p className="text-xl">Current Version: <span className="font-semibold">{currentVersion}</span>
                    </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-2">Details</h2>
                    <History path={path}/>
                </div>
            </div>

            <div className="p-8 bg-gray-100 flex-1">
                <h2 className="text-2xl font-semibold mb-4">Create New Version</h2>
                <div className="bg-white rounded-lg p-4 shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2"
                               htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">File Summary</h3>
                        <div className="bg-gray-100 p-4 rounded">
                            <div className="mb-2">
                                <h4 className="text-lg font-semibold">Modified Files</h4>
                                <ul className="list-disc ml-5">
                                    {/* modified files */}
                                </ul>
                            </div>
                            <div className="mb-2">
                                <h4 className="text-lg font-semibold">New Files</h4>
                                <ul className="list-disc ml-5">
                                    {/* new files */}
                                </ul>
                            </div>
                            <div className="mb-2">
                                <h4 className="text-lg font-semibold">Deleted Files</h4>
                                <ul className="list-disc ml-5">
                                    {/* deleted files */}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAddVersion}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Create Version
                    </button>
                </div>
            </div>
        </div>
    </div>);
};

export default ProjectDetail;