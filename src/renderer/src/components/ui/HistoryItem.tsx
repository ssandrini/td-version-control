import React from 'react';
import { Version } from '../../../../main/models/Version';
import { cn } from '../../lib/utils';
import { FaCalendar, FaUserCircle } from 'react-icons/fa';
import VersionActions from '@renderer/components/ui/VersionActions';
import { FaDiagramProject } from 'react-icons/fa6';
import Project from '../../../../main/models/Project';

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
}

const HistoryItem: React.FC<HistoryItemProps> = ({
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
    return (
        <div
            className="flex flex-row w-full h-fit items-center text-nowrap text-ellipsis overflow-hidden"
            onClick={onClick}
        >
            <div
                className={cn(
                    'h-fit rounded-lg w-full transform transition-all duration-600 ease-in-out sticky',
                    'text-gray-100 px-2 py-0 flex flex-row items-center gap-1 justify-center'
                )}
            >
                {false && (
                    <div className="absolute left-0 top-0 z-50">
                        <div className="font-bold bg-orange-500 rounded-lg shadow-lg p-1">
                            {'TAG'}
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
