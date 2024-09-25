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
import { cn } from "../../lib/utils";
import { FaEdit, FaMinus, FaPlus, FaUserCircle } from "react-icons/fa";
import FileCard from "../../components/ui/FileCard.tsx";

const ProjectDetail: React.FC = () => {
    const handleResizeMouseDown = (e) => {
        const textarea = e.target.previousSibling;
        let startY = e.clientY;
        let startHeight = textarea.offsetHeight;

        const handleMouseMove = (event) => {
            const newHeight = startHeight + (event.clientY - startY);
            textarea.style.height = `${newHeight}px`;
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const location = useLocation();
    const dir = location.state?.path;
    const projectName = location.state?.projectName;
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
            .then((changes: ChangeSet<TDNode>) => {
                log.debug("Change set:", changes);
                log.debug("Added:", changes.added.items);
                log.debug("Deleted:", changes.modified.items);
                log.debug("Modified:", changes.deleted.items);
                setChanges(changes);
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

    return (<div className="flex flex-col w-full h-full">
        <div className="p-8 text-white w-full overflow-auto bg-gray-900 flex-1">
            <div className="flex flex-col gap-3 mb-4 w-full">
                <div className="flex flex-col items-center text-4xl w-full">
                    <div className="font-semibold w-full overflow-x-auto overflow-hidden text-center">
                        {projectName}
                    </div>
                </div>
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

            <div className="bg-gray-800 rounded-lg p-4 flex w-full overflow-auto">
                <div className="w-1/3">
                    <h2 className="text-2xl font-semibold mb-2">Version History</h2>
                    <History
                        versions={versions}
                        path={dir}
                        onVersionSelect={handleVersionSelect}
                        currentVersion={currentVersion}
                        selectedVersion={selectedVersion}
                    />
                </div>
                <div className="w-2/3 ml-4 bg-gray-700 text-white p-6 rounded-lg">
                    {selectedVersion ? (
                        <>
                            <h2 className="text-2xl text-center">
                                {selectedVersion.name}
                            </h2>

                            <p className="text-center text-gray-400 text-sm mt-1">
                                {selectedVersion.date.toDateString()}
                            </p>

                            <hr className="border-white opacity-50 my-4" />

                            <div className="flex items-center justify-left mt-4">
                                <FaUserCircle className="text-5xl text-gray-300 mr-2" />
                                <div>
                                    <p className="font-medium">{selectedVersion.author.name}</p>
                                    <p className="text-gray-400 text-sm">{selectedVersion.author.email}</p>
                                </div>
                            </div>

                            <div className="bg-gray-800 text-white p-4 mt-4 min-h-20 relative rounded-lg">
                                <textarea
                                    value={selectedVersion.description}
                                    readOnly
                                    className="w-full bg-gray-800 text-white p-4 rounded-lg resize-none overflow-auto min-h-[100px] h-auto"
                                    style={{ minHeight: "80px", maxHeight: "300px" }}  // Altura mínima ajustada
                                />

                                <div
                                    className="w-1/5 h-1 bg-gray-700 mt-2 mx-auto cursor-row-resize rounded-full"
                                    onMouseDown={handleResizeMouseDown}  // Evento para manejar el redimensionamiento
                                ></div>
                            </div>

                            <div className="mt-4 bg-gray-850 p-4 rounded-lg">
                                <div className="flex flex-row gap-3 py-4 flex-wrap">
                                    {changes.added.items.map((change, index) => (
                                        <FileCard
                                            key={index}
                                            change={change}
                                            icon={FaPlus}
                                            iconColor="text-green-500"
                                        />
                                    ))}
                                    {changes.deleted.items.map((change, index) => (
                                        <FileCard
                                            key={index}
                                            change={change}
                                            icon={FaMinus}
                                            iconColor="text-red-600"
                                        />
                                    ))}
                                    {changes.modified.items.map((change, index) => (
                                        <FileCard
                                            key={index}
                                            change={change}
                                            icon={FaEdit}
                                            iconColor="text-blue-800"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGoToVersion}
                                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
                            >
                                Checkout this version
                            </button>
                        </>
                    ) : (
                        <p>Select a version to see details.</p>
                    )}
                </div>

            </div>
        </div>
    </div>);
};

export default ProjectDetail;
