import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import History from "../../components/ui/history";
import {Version} from "../../../electron/models/Version.ts";
import {Label} from "../../components/ui/label.tsx";
import {Input} from "../../components/ui/input.tsx";
import log from "electron-log/renderer";
import {TDNode} from "../../../electron/models/TDNode.ts";
import {ChangeSet} from "../../../electron/models/ChangeSet.ts";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../components/ui/dialog";
import {Button} from "../../components/ui/button";

const ProjectDetail: React.FC = () => {
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
    }, [dir, currentVersion]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .compareVersions(dir)
            .then((changes: ChangeSet<TDNode>) => {
                console.log("Change set:", changes);
                console.log("Added:", changes.added);
                console.log("Deleted:", changes.modified);
                console.log("Modified:", changes.deleted);
                setChanges(changes);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                log.error("Error retrieving changeset due to", error);
                // TODO handle error
            });
    }, [dir]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const handleAddVersion = () => {
        log.info("version a crear:", {title: name, description});
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
                <div className="flex flex-col text-4xl w-full">
                    Project:
                    <div className="font-semibold w-full overflow-x-auto overflow-hidden">
                        {projectName}
                    </div>
                </div>
                <div className="flex flex-col text-xl">
                    Current Version:
                    <div className="font-semibold">{currentVersion?.name}</div>
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
                <div className="w-2/3 ml-4 bg-gray-700 text-white p-4 rounded-lg">
                    {selectedVersion ? (<>
                        <h3 className="text-xl font-semibold mb-2">Details</h3>
                        <p>
                            <strong>Author:</strong> {selectedVersion.author}
                        </p>
                        <p>
                            <strong>Date:</strong> {selectedVersion.date.toDateString()}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedVersion.description}
                        </p>
                        {changes.added.concat(changes.deleted).concat(changes.modified).map((change, index) => (
                            <div key={index}>{change.name} {change.type}</div>))}
                        <button
                            onClick={handleGoToVersion}
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
