import React from 'react';
import { Version } from '../../../../main/models/Version';
import { cn } from '../../lib/utils';
import { FaCalendar, FaUserCircle } from 'react-icons/fa';
import VersionActions from '@renderer/components/ui/VersionActions';

interface HistoryItemProps {
    version: Version;
    isCurrent: boolean;
    onClick?: () => void;
    isSelected: boolean;
    onVersionSelect: (version: Version) => void;
    handleGoToVersion: (version: Version) => void;
    handleCompareVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    compareVersion: Version | null;
    selectedVersion?: Version;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
    version,
    isCurrent,
    onClick,
    isSelected,
    onVersionSelect,
    currentVersion,
    selectedVersion,
    handleGoToVersion,
    handleCompareVersionSelect,
    compareVersion
}) => {
    return (
        <div
            className="flex flex-row w-full h-fit items-center text-nowrap text-ellipsis overflow-hidden py-4"
            onClick={onClick}
        >
            <div
                className={cn(
                    isSelected ? 'bg-gray-600' : '',
                    'h-fit rounded-lg w-full m-2 transform transition-all duration-600 ease-in-out sticky',
                    'text-gray-100 px-2 py-1 flex flex-row items-center gap-1 justify-center',
                    version?.id === '[wip]'
                        ? 'border-dashed border-2 border-gray-400'
                        : 'border-solid border-2 border-white'
                )}
            >
                {false && (
                    <div className="absolute left-0 bottom-14">
                        <div className="font-bold bg-orange-500 rounded-lg shadow-lg p-1">
                            {'TAG'}
                        </div>
                    </div>
                )}
                {(isCurrent ||
                    version.id === selectedVersion?.id ||
                    version.id === compareVersion?.id) && (
                    <div className="absolute right-0 top-14">
                        <div className="flex flex-row gap-2">
                            {isCurrent && (
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
                <div className="flex flex-col w-[70%] h-fit">
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
                    currentVersion={currentVersion}
                    version={version}
                    selectedVersion={selectedVersion}
                    compareVersion={compareVersion}
                    handleGoToVersion={handleGoToVersion}
                    onVersionSelect={onVersionSelect}
                    handleCompareVersionSelect={handleCompareVersionSelect}
                />
            </div>
        </div>
    );
};

export default HistoryItem;
