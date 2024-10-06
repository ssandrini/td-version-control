import React, {useState} from "react";
import {Button} from "../../../components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "../../../components/ui/dialog";
import {Label} from "../../../components/ui/label";
import {Input} from "../../../components/ui/input";
import {FaUserCircle} from "react-icons/fa";
import {Version} from "../../../../electron/models/Version";
import log from "electron-log/renderer";
import History from "../../../components/ui/history";

interface DetailsComponentProps {
    versions: Version[];
    setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
    currentVersion: Version | null;
    setCurrentVersion: React.Dispatch<React.SetStateAction<Version | null>>;
    selectedVersion: Version;
    setSelectedVersion: React.Dispatch<React.SetStateAction<Version | null>>
    dir: string;
}

const DetailsComponent: React.FC<DetailsComponentProps> = ({
                                                               versions,
                                                               currentVersion,
                                                               selectedVersion,
                                                               setCurrentVersion,
                                                               setSelectedVersion,
                                                               setVersions,
                                                               dir
                                                           }) => {
    const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>(false);
    const [isLoadingNewVersion, setIsLoadingNewVersion] = useState<boolean>(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleGoToVersion = () => {
        if (selectedVersion) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.goToVersion(dir, selectedVersion.id).then((newVersion) => {
                setCurrentVersion(newVersion);
            });
        }
    };

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

    return (<>
        {versions[0] && versions[0].name === currentVersion?.name && (<div
            className="flex my-5"
        >
            <div className="flex flex-row space-x-4 items-center w-full">
                <Button variant="outline" className="text-black"
                        onClick={() => setShowNewVersionModal(true)}>Create New
                    Version</Button>
                {selectedVersion.id != currentVersion?.id && (<div className="flex justify-center">
                    <button
                        onClick={handleGoToVersion}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 max-w-64"
                    >
                        Move
                    </button>
                </div>)}
            </div>
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
        <h2 className="text-white font-semibold mb-2">Version History</h2>
        <History
            versions={versions}
            path={dir}
            onVersionSelect={handleVersionSelect}
            currentVersion={currentVersion}
            selectedVersion={selectedVersion}
        />
        <hr className="border-white opacity-50 my-4"/>

        <div className="flex items-center justify-left mt-4">
            <FaUserCircle className="text-5xl text-gray-300 mr-2"/>
            <div>
                <p className="font-medium">{selectedVersion.author.name}</p>
                <p className="text-gray-400 text-sm">{selectedVersion.author.email}</p>
            </div>
        </div>
        <textarea
            value={selectedVersion.description}
            readOnly
            className="w-full h-full  mt-4 bg-gray-800 text-white p-4 rounded-lg"
            style={{minHeight: "80px", maxHeight: "150px"}}
        />
    </>);
}

export default DetailsComponent;