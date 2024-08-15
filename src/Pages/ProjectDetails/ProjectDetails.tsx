import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import History from '../../components/ui/history';
import { Version } from '../../../electron/td-mgr/td-mgr';

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const path = location.state?.path;
    const projectName = location.state?.projectName;
    const [currentVersion, setCurrentVersion] = useState<string>('');
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [selectedVersionName, setSelectedVersionName] = useState<string>('');
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getCurrentVersion(path).then((version: Version) => {
            setCurrentVersion(version.name);
        });
    }, [path]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const handleAddVersion = () => {
        console.log('version a crear:', { title, description });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.createNewVersion(title, description, path).then((created) => {
            if (created) {
                console.log("version creada");
            } else {
                console.log("no pudo crear");
            }
        });
        // TO DO, COMO ACTUALIZO HISTORY??
    };

    const handleVersionSelect = (version: Version) => {
        setSelectedVersion(version);
        setSelectedVersionName(version.name);
    };

    const handleCheckoutVersion = () => {
        if (selectedVersion) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.checkoutVersion(selectedVersion.name, path).then((changed) => {
                if (changed) {
                    setCurrentVersion(selectedVersion.name);
                } else {
                    console.log("fallo el checkout");
                }
            });
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 bg-gray-100 p-8 flex">
                <div className="p-8 text-white bg-gray-900 flex-1">
                    <div className="mb-4">
                        <h1 className="text-4xl font-semibold mb-2">Project: {projectName}</h1>
                        <p className="text-xl">Current Version: <span className="font-semibold">{currentVersion}</span></p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 flex">
                        <div className="w-1/3">
                            <h2 className="text-2xl font-semibold mb-2">Version History</h2>
                            <History path={path} onVersionSelect={handleVersionSelect} currentVersion={currentVersion} selectedVersion={selectedVersionName} />
                        </div>
                        <div className="w-2/3 ml-4 bg-gray-700 text-white p-4 rounded-lg">
                            {selectedVersion ? (
                                <>
                                    <h3 className="text-xl font-semibold mb-2">Details</h3>
                                    <p><strong>Author:</strong> {selectedVersion.author}</p>
                                    <p><strong>Date:</strong> {selectedVersion.date}</p>
                                    <p><strong>Description:</strong> {selectedVersion.description}</p>
                                    <button
                                        onClick={handleCheckoutVersion}
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
                                    >
                                        Checkout this version
                                    </button>
                                </>
                            ) : (
                                <p>Select a version to see details.</p>
                            )}
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
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
