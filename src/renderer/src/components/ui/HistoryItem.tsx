import React, { useState } from 'react';
import { Version } from '../../../../main/models/Version';
import { cn } from '../../lib/utils';
import { FaCalendar, FaTrash, FaUserCircle } from 'react-icons/fa';
import VersionActions from '@renderer/components/ui/VersionActions';
import { FaDiagramProject } from 'react-icons/fa6';
import Project from '../../../../main/models/Project';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@renderer/components/ui/dialog';
import { Label } from '@renderer/components/ui/label';
import { Input } from '@renderer/components/ui/input';
import { Button } from '@renderer/components/ui/button';

interface HistoryItemProps {
    project: Project | undefined;
    setSelectedVersion: React.Dispatch<React.SetStateAction<Version | undefined>>;
    setWipVersion: React.Dispatch<React.SetStateAction<Version | null>>;
    version: Version;
    versions: Version[];
    isCurrent: boolean;
    onClick?: () => void;
    isSelected: boolean;
    onVersionSelect: (version: Version) => void;
    handleGoToVersion: (version: Version) => void;
    handleCompareVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    compareVersion: Version | null;
    setCurrentVersion: (version: Version) => void;
    selectedVersion?: Version;
    setShowNewVersionModal?: (boolean: boolean) => void;
    dir: string | undefined;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
    dir,
    project,
    setWipVersion,
    setSelectedVersion,
    version,
    versions,
    isCurrent,
    onClick,
    isSelected,
    onVersionSelect,
    currentVersion,
    selectedVersion,
    handleGoToVersion,
    handleCompareVersionSelect,
    compareVersion,
    setShowNewVersionModal,
    setCurrentVersion
}) => {
    const [showCreateTag, setShowCreateTag] = useState<boolean>(false);
    const [showCreateTagModal, setShowCreateTagModal] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>('');

    const [isLoadingTag, setIsLoadingTag] = useState<boolean>(false);

    const [tagError, setTagError] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleAddTag = (version: Version, tag: string) => {
        setTagError(false);
        setIsLoadingTag(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api
            .addTag(dir, version.id, tag)
            .then(() => {
                const updatedVersionWithTag = { ...version };
                updatedVersionWithTag.tag = tag;
                setSelectedVersion(updatedVersionWithTag);
                setNewTag('');
                setShowCreateTag(false);
            })
            .catch(() => {
                setTagError(true);
            })
            .finally(() => {
                setIsLoadingTag(false);
            });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRemoveTag = (version: Version) => {
        setTagError(false);
        if (!version.tag) {
            return;
        }
        setIsLoadingTag(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        window.api
            .removeTag(dir, version.tag) // IMPORTANT: ONLY THE TAG IS NEEDED TO REMOVE A TAG.
            .then(() => {
                const updatedVersionWithTag = { ...version };
                updatedVersionWithTag.tag = '';
                setSelectedVersion(updatedVersionWithTag);
                setNewTag('');
            })
            .catch(() => {})
            .finally(() => {
                setIsLoadingTag(false);
            });
    };

    return (
        <div
            className="flex flex-row w-full h-fit items-center text-nowrap text-ellipsis overflow-hidden"
            onClick={onClick}
            onMouseEnter={() => setShowCreateTag(true)}
            onMouseLeave={() => setShowCreateTag(false)}
        >
            <div
                className={cn(
                    'h-fit rounded-lg w-full transform transition-all duration-600 ease-in-out sticky',
                    'text-gray-100 px-2 py-0 flex flex-row items-center gap-1 justify-center'
                )}
            >
                {showCreateTag &&
                    version.id === selectedVersion?.id &&
                    version.id != '[wip]' &&
                    !version.tag && (
                        <motion.div
                            className="absolute left-0 top-0 z-50"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            onClick={() => setShowCreateTagModal(true)}
                        >
                            <div className="font-bold text-center bg-green-500 w-10 h-10 rounded-lg shadow-lg">
                                {'+'}
                            </div>
                        </motion.div>
                    )}
                {showCreateTagModal && (
                    <Dialog open>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tag this version</DialogTitle>
                                <DialogDescription>
                                    Add a tag to mark this version. Tags should be short, concise
                                    and can not contain spaces.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mb-4">
                                <Label
                                    className="block text-gray-700 font-semibold mb-2"
                                    htmlFor="tag"
                                >
                                    Tag
                                </Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    onKeyDown={(e) => {
                                        if (e.key === ' ') {
                                            // jaja que queres? poner un espacio? no.
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    disabled={isLoadingTag}
                                    onClick={() => setShowCreateTagModal(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleAddTag(version, newTag)}
                                    disabled={isLoadingTag || newTag.length >= 8}
                                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                                >
                                    Create Version
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                {version.tag && (
                    <div className="absolute left-0 top-0 z-50">
                        <div className="flex flex-row bg-orange-500 rounded-lg shadow-lg p-1 gap-2 items-center">
                            <div className="font-bold">{version.tag.split(/\s+/)[0]}</div>
                            <FaTrash
                                className="cursor-pointer"
                                onClick={() => handleRemoveTag(version)}
                            />
                        </div>
                    </div>
                )}
                {(isCurrent ||
                    version.id === selectedVersion?.id ||
                    version.id === compareVersion?.id ||
                    version.id === '[wip]') && (
                    <div className="absolute right-0 top-0 z-50">
                        <div className="flex flex-row gap-2">
                            {version.id === currentVersion?.id && (
                                <div className="shadow-lg rounded-lg bg-gradient-to-r via-[rgb(75, 60, 144)] from-[rgb(59,243,197)] to-[rgb(58,42,177)] p-1">
                                    <div className="text-white bg-transparent font-bold px-0.5 py-0 rounded-lg">
                                        Current
                                    </div>
                                </div>
                            )}
                            {version.id === selectedVersion?.id && (
                                <div className="shadow-lg rounded-lg bg-gradient-to-r to-cyan-400 via-violet-500 from-red-200 p-1">
                                    <div className="text-white bg-transparent font-bold px-0.5 py-0 rounded-lg">
                                        Preview
                                    </div>
                                </div>
                            )}
                            {version.id === compareVersion?.id && (
                                <div className="shadow-lg rounded-lg bg-gradient-to-r  from-purple-400 via-pink-500 to-yellow-500 p-1">
                                    <div className="text-white bg-transparent font-bold px-0.5 py-0 rounded-lg">
                                        Compare
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div
                    className={cn(
                        isSelected ? 'bg-gray-600' : '',
                        'mx-3 mb-3 mt-6 p-2 h-fit rounded-lg w-full transform transition-all duration-600 ease-in-out sticky',
                        'text-gray-100 flex flex-row items-center gap-1 justify-center',
                        version?.id === '[wip]'
                            ? 'border-dashed border-2 border-gray-400'
                            : 'border-solid border-2 border-white'
                    )}
                >
                    <div className="flex flex-col w-[70%] h-fit">
                        <div className="w-full text-left flex flex-row gap-0.5 whitespace-pre-wrap break-words overflow-wrap break-word items-center">
                            <FaDiagramProject className="text-sm text-gray-300 mr-2" />
                            <div>{version?.name ?? '------'}</div>
                        </div>
                        <div className="w-full text-left flex flex-row gap-0.5 items-center">
                            <FaUserCircle className="text-sm text-gray-300 mr-2" />
                            <div>{version?.author.name ?? '------'}</div>
                        </div>
                        <div className="w-full text-left flex flex-row gap-0.5 items-center">
                            <FaCalendar className="text-sm text-gray-300 mr-2" />
                            <div>
                                {version?.date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }) ?? '-------'}
                            </div>
                        </div>
                    </div>
                    <VersionActions
                        versions={versions}
                        setSelectedVersion={setSelectedVersion}
                        setWipVersion={setWipVersion}
                        project={project}
                        currentVersion={currentVersion}
                        version={version}
                        selectedVersion={selectedVersion}
                        compareVersion={compareVersion}
                        handleGoToVersion={handleGoToVersion}
                        onVersionSelect={onVersionSelect}
                        handleCompareVersionSelect={handleCompareVersionSelect}
                        setShowNewVersionModal={setShowNewVersionModal}
                        setCurrentVersion={setCurrentVersion}
                    />
                </div>
            </div>
        </div>
    );
};

export default HistoryItem;
