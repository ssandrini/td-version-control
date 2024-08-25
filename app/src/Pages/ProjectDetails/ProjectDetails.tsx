import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import History from '../../components/ui/history';
import {Version} from '../../../electron/td-mgr/td-mgr';
import {Label} from "../../components/ui/label.tsx";
import {Input} from "../../components/ui/input.tsx";
import log from 'electron-log/renderer';

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const path = location.state?.path;
    const projectName = location.state?.projectName;
    const [currentVersion, setCurrentVersion] = useState<string>('');
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [selectedVersionName, setSelectedVersionName] = useState<string>('');
    const [versions, setVersions] = useState<Version[]>([]);


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getCurrentVersion(path).then((version: Version) => {
            setCurrentVersion(version.name);
        });
    }, [path]);


    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.listVersions(path).then((versions: Version[]) => {
            setVersions(versions);
        }).catch(() => {
            setVersions([]);
        });
    }, [path, currentVersion]);


    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const handleAddVersion = () => {
        log.info('version a crear:', {title, description});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.createNewVersion(title, description, path).then((created) => {
            if (created) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                window.api.listVersions(path).then((versions: Version[]) => {
                    setVersions(versions);
                    setSelectedVersion(versions[0]);
                    setCurrentVersion(versions[0]?.name ?? "");
                });
            } else {
                log.info("no pudo crear");
            }
        });
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
                    log.info('Log from the renderer');
                    setCurrentVersion(selectedVersion.name);
                } else {
                    log.info("fallo el checkout");
                }
            });
        }
    };

    return (<div className="flex flex-col w-full h-full">
        <div className="p-8 text-white w-full overflow-auto bg-gray-900 flex-1">
            <div className="flex flex-col gap-3 mb-4 w-full">
                <div className="flex flex-col text-4xl w-full">
                    Project:
                    <div className="font-semibold w-full overflow-x-auto overflow-hidden">{projectName}</div>
                </div>
                <div className="flex flex-col text-xl">
                    Current Version:
                    <div className="font-semibold">{currentVersion}</div>
                </div>
            </div>

            {versions[0] && versions[0].name === currentVersion && (
                <div className="p-8 flex-1">
                    <h2 className="text-2xl font-semibold mb-4">Create New Version</h2>
                    <div className="bg-white rounded-lg p-4 shadow text-gray-700">
                        <div className="mb-4">
                            <Label className="block text-gray-700 font-semibold mb-2" htmlFor="title">Title</Label>
                            <Input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === ' ') {  // jaja que queres? poner un espacio? no.
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>

                        <div className="mb-4">
                            <Label className="block text-gray-700 font-semibold mb-2"
                                   htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        <div className="mb-4 text-gray-700">
                            <h3 className="text-xl font-semibold mb-2">File Summary</h3>
                            <div className="p-4 rounded">
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
                </div>)}

            <div className="bg-gray-800 rounded-lg p-4 flex w-full overflow-auto">
                <div className="w-1/3">
                    <h2 className="text-2xl font-semibold mb-2">Version History</h2>
                    <History versions={versions} path={path} onVersionSelect={handleVersionSelect}
                             currentVersion={currentVersion}
                             selectedVersion={selectedVersionName}/>
                </div>
                <div className="w-2/3 ml-4 bg-gray-700 text-white p-4 rounded-lg">
                    {selectedVersion ? (<>
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
                    </>) : (<p>Select a version to see details.</p>)}
                </div>
            </div>
        </div>
    </div>);
};

export default ProjectDetail;
