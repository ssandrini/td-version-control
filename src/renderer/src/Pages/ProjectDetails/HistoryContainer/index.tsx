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
            });
    };

    const handleVersionSelect = (version: Version) => {
        setSelectedVersion(version);
    };

    const handleCompareVersionSelect = (version: Version | null) => {
        setCompareVersion(version);
    };
    /*
    // TODO: implement this
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleAddTag = (version: Version, tag: string) => {
        log.info('Adding tag:', { tag: tag, version: version.name });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api
            .addTag(dir, version.id, tag)
            .then((_) => {
                log.info('Tag succesfully added:', { tag: tag, version: version.name });
            })
            .catch((err: any) => {
                log.error(`Error adding tag:`, err);
            })
            .finally(() => {});
    };

    // TODO: implement this
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRemoveTag = (version: Version) => {
        if (!version.tag) {
            log.info(`No tag for version ${version.id}`);
            return;
        }
        log.info('Removing tag:', { tag: version.tag, version: version.name });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api
            .removeTag(dir, version.tag) // IMPORTANT: ONLY THE TAG IS NEEDED TO REMOVE A TAG.
            .then((_) => {
                log.info('Tag succesfully removed:', { version: version.name });
            })
            .catch((err: any) => {
                log.error(`Error removing tag:`, err);
            })
            .finally(() => {});
    };*/

    return (
        <div className="h-full w-full my-2">
            {wipVersion && (
                <div className="flex my-5">
                    <div className="flex flex-col space-x-4 items-center w-full">
                        <Button
                            variant="outline"
                            className="text-black"
                            onClick={() => setShowNewVersionModal(true)}
                        >
                            Create New Version
                        </Button>
                    </div>
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
                                        onKeyDown={(e) => {
                                            if (e.key === ' ') {
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
            />
        </div>
    );
};

export default HistoryContainer;