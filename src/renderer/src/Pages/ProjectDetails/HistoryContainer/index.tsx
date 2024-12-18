import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Version } from '../../../../../main/models/Version';
import History from '../../../components/ui/history';
import Project from '../../../../../main/models/Project';

interface HistoryContainerProps {
    project: Project | undefined;
    versions: Version[];
    setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
    currentVersion: Version | null;
    setCurrentVersion: React.Dispatch<React.SetStateAction<Version | null>>;
    compareVersion: Version | null;
    setCompareVersion: React.Dispatch<React.SetStateAction<Version | null>>;
    selectedVersion?: Version;
    setSelectedVersion: React.Dispatch<React.SetStateAction<Version | undefined>>;
    dir: string | undefined;
    wipVersion: Version | null;
    setWipVersion: React.Dispatch<React.SetStateAction<Version | null>>;
}

const HistoryContainer: React.FC<HistoryContainerProps> = ({
    project,
    versions,
    currentVersion,
    selectedVersion,
    setCurrentVersion,
    setSelectedVersion,
    setCompareVersion,
    compareVersion,
    setVersions,
    dir,
    wipVersion,
    setWipVersion
}) => {
    const [showNewVersionModal, setShowNewVersionModal] = useState<boolean>(false);
    const [isLoadingNewVersion, setIsLoadingNewVersion] = useState<boolean>(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleGoToVersion = (version: Version) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.goToVersion(dir, version.id).then((newVersion: Version) => {
            setCurrentVersion(newVersion);
            setSelectedVersion(version);
        });
    };

    const handleAddVersion = () => {
        setIsLoadingNewVersion(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api
            .createNewVersion(dir, name, description)
            .then((newVersion: Version) => {
                setWipVersion(null);
                setCurrentVersion(newVersion);
                setVersions([newVersion, ...versions]);
                setSelectedVersion(newVersion);
            })
            .finally(() => {
                setShowNewVersionModal(false);
                setIsLoadingNewVersion(false);
                setName('');
                setDescription('');
            });
    };

    const handleVersionSelect = (version: Version) => {
        setSelectedVersion(version);
    };

    const handleCompareVersionSelect = (version: Version | null) => {
        setCompareVersion(version);
    };

    return (
        <div className="h-full w-full my-2">
            {wipVersion && (
                <div className="flex my-5">
                    {showNewVersionModal && (
                        <Dialog open>
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
                                    <Button
                                        type="button"
                                        disabled={isLoadingNewVersion}
                                        onClick={() => setShowNewVersionModal(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleAddVersion}
                                        disabled={
                                            isLoadingNewVersion ||
                                            name.length === 0 ||
                                            description.length === 0
                                        }
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                    >
                                        Create Version
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )}
            <History
                setVersions={setVersions}
                project={project}
                setSelectedVersion={setSelectedVersion}
                setWipVersion={setWipVersion}
                wipVersion={wipVersion}
                versions={versions}
                path={dir}
                onVersionSelect={handleVersionSelect}
                currentVersion={currentVersion}
                selectedVersion={selectedVersion}
                handleGoToVersion={handleGoToVersion}
                handleCompareVersionSelect={handleCompareVersionSelect}
                compareVersion={compareVersion}
                setShowNewVersionModal={setShowNewVersionModal}
                setCurrentVersion={setCurrentVersion}
                dir={dir}
            />
        </div>
    );
};

export default HistoryContainer;
