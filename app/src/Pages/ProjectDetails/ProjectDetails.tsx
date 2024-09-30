import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import History from "../../components/ui/history";
import { Version } from "../../../electron/models/Version.ts";
import { Label } from "../../components/ui/label.tsx";
import { Input } from "../../components/ui/input.tsx";
import log from "electron-log/renderer";
import { TDNode } from "../../../electron/models/TDNode.ts";
import { ChangeSet } from "../../../electron/models/ChangeSet.ts";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { FaEdit, FaMinus, FaPlus, FaUserCircle } from "react-icons/fa";
import OperatorCard from "../../components/ui/OperatorCard.tsx";

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const dir = location.state?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [changes, setChanges] = useState<ChangeSet<TDNode>>(new ChangeSet<TDNode>());
    const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>(false);
    const [isLoadingNewVersion, setIsLoadingNewVersion] = useState<boolean>(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getCurrentVersion(dir).then((version: Version) => {
            setCurrentVersion(version);
        });
    }, [dir]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .listVersions(dir)
            .then((versions: Version[]) => {
                setVersions(versions);
            })
            .catch(() => {
                setVersions([]);
            });
    }, [currentVersion]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .compareVersions(dir, selectedVersion?.id)
            .then((serializedChangeSet) => {
                const changeSet = ChangeSet.deserialize(serializedChangeSet, TDNode.deserialize);
                // log.debug("Change set:", changeSet);
                // log.debug("Added:", changeSet.added.items.map(node => node.toString()));
                // log.debug("Deleted:", changeSet.deleted.items.map(node => node.toString()));
                // log.debug("Modified:", changeSet.modified.items.map(node => node.toString()));
                // const modifiedNode = changeSet.modified.items[0];
                // // JERO TE DEJO UN EJEMPLO DE COMO ACCEDER A LAS PROPERTIES
                // if (modifiedNode && modifiedNode.properties) {
                //     modifiedNode.properties.forEach((value, key) => {
                //         log.debug(`Propiedad: ${key}, Valor: ${value}`);
                //     });
                // }
                setChanges(changeSet);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                log.error("Error retrieving changeset due to", error);
                // TODO handle error
            });
    }, [selectedVersion]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const handleAddVersion = () => {
        log.info("version a crear:", { title: name, description });
        setIsLoadingNewVersion(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api.createNewVersion(dir, name, description).then((_) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.listVersions(dir).then((versions: Version[]) => {
                setVersions(versions);
                setSelectedVersion(versions[0]);
                setCurrentVersion(versions[0]);
            });
        }).finally(() => {
            setShowNewVersionModal(false);
            setIsLoadingNewVersion(false);
        });
    };

    const handleVersionSelect = (version: Version) => {
        setSelectedVersion(version);
    };

    const handleGoToVersion = () => {
        if (selectedVersion) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.goToVersion(dir, selectedVersion.id).then((newVersion) => {
                setCurrentVersion(newVersion);
            });
        }
    };

    return (
        <div className="bg-gray-800 p-4 flex w-full h-[100vh]">
            <div className="w-1/3 h-full overflow-y-auto">
                <h2 className="text-2xl text-white font-semibold mb-2 text-center">Version History</h2>
                <History
                    versions={versions}
                    path={dir}
                    onVersionSelect={handleVersionSelect}
                    currentVersion={currentVersion}
                    selectedVersion={selectedVersion}
                />
            </div>

            <div className="w-2/3 ml-4 bg-gray-700 text-white p-6 h-full flex flex-col">
                {selectedVersion ? (
                    <>
                        <h2 className="text-2xl text-center">{selectedVersion.name}</h2>
                        <p className="text-center text-gray-400 text-sm mt-1">
                            {selectedVersion.date.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleGoToVersion}
                                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4 max-w-[20%]"
                            >
                                Move
                            </button>
                        </div>
                        {versions[0] && versions[0].name === currentVersion?.name && (<div className="flex my-5">
                            <Button variant="outline" className="text-black" onClick={() => setShowNewVersionModal(true)}>Create New
                                Version</Button>
                            {showNewVersionModal && (<Dialog open>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create a new version</DialogTitle>
                                        <DialogDescription>
                                            Changes detected, commit a new version.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mb-4">
                                        <Label
                                            className="block text-gray-700 font-semibold mb-2"
                                            htmlFor="title"
                                        >
                                            Title
                                        </Label>
                                        <Input
                                            type="text"
                                            id="title"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            onKeyDown={(e) => {
                                                if (e.key === " ") {
                                                    // jaja que queres? poner un espacio? no.
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <Label
                                            className="block text-gray-700 font-semibold mb-2"
                                            htmlFor="description"
                                        >
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button"
                                                disabled={isLoadingNewVersion}
                                                onClick={() => setShowNewVersionModal(false)}>Cancelar</Button>
                                        <Button
                                            onClick={handleAddVersion}
                                            disabled={isLoadingNewVersion || name.length === 0 || description.length === 0}
                                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                        >
                                            Create Version
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>)}
                        </div>)}


                        <hr className="border-white opacity-50 my-4" />

                        <div className="flex items-center justify-left mt-4">
                            <FaUserCircle className="text-5xl text-gray-300 mr-2" />
                            <div>
                                <p className="font-medium">{selectedVersion.author.name}</p>
                                <p className="text-gray-400 text-sm">{selectedVersion.author.email}</p>
                            </div>
                        </div>

                        <textarea
                            value={selectedVersion.description}
                            readOnly
                            className="w-full h-full  mt-4 bg-gray-800 text-white p-4 rounded-lg"
                            style={{ minHeight: "80px", maxHeight: "150px" }}
                        />


                        <div className="mt-4 bg-gray-800 p-4 rounded-lg h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                            <div className="flex flex-row gap-3 py-4 flex-wrap">
                                {changes.added.items.map((change, index) => (
                                    <OperatorCard
                                        key={index}
                                        change={change}
                                        icon={FaPlus}
                                        iconColor="text-green-500"
                                    />
                                ))}
                                {changes.deleted.items.map((change, index) => (
                                    <OperatorCard
                                        key={index}
                                        change={change}
                                        icon={FaMinus}
                                        iconColor="text-red-600"
                                    />
                                ))}
                                {changes.modified.items.map((change, index) => (
                                    <OperatorCard
                                        key={index}
                                        change={change}
                                        icon={FaEdit}
                                        iconColor="text-blue-800"
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Select a version to see details.</p>
                )}
            </div>
        </div >

    );
};

export default ProjectDetail;
