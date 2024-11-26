import React from 'react';
import HistoryItem from './HistoryItem';
import { Version } from '../../../../main/models/Version';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { FaArrowUp } from 'react-icons/fa';
import { Skeleton } from '@renderer/components/ui/skeleton';

interface HistoryProps {
    path?: string;
    onVersionSelect: (version: Version) => void;
    handleGoToVersion: (version: Version) => void;
    handleCompareVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    compareVersion: Version | null;
    selectedVersion?: Version;
    versions: Version[];
    orange?: boolean;
    wipVersion: Version | null;
}

const History: React.FC<HistoryProps> = ({
    versions,
    onVersionSelect,
    currentVersion,
    selectedVersion,
    orange,
    handleGoToVersion,
    handleCompareVersionSelect,
    compareVersion,
    wipVersion
}) => {
    return (
        <div className="flex flex-col items-center overflow-y-auto no-scrollbar max-h-[90%] w-[20rem]">
            {wipVersion && (
                <HistoryItem
                    version={wipVersion}
                    isCurrent={wipVersion.id === currentVersion?.id}
                    isSelected={wipVersion.id === selectedVersion?.id}
                    orange={orange}
                />
            )}
            {versions.length === 0 ? (
                <Skeleton />
            ) : (
                versions.map((version, index) => (
                    <Popover key={version.name}>
                        <PopoverTrigger className="flex flex-col items-center justify-center gap-1">
                            {index != 0 && <FaArrowUp className="text-white" />}
                            <HistoryItem
                                version={version}
                                isCurrent={version.id === currentVersion?.id}
                                isSelected={version.id === selectedVersion?.id}
                                orange={orange}
                            />
                        </PopoverTrigger>
                        <PopoverContent className="p-2">
                            <div className="flex flex-col gap-1">
                                <div
                                    className={cn(
                                        currentVersion?.id === version.id
                                            ? '!text-gray-500 !cursor-default'
                                            : 'cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40',
                                        'p-2 flex flex-col'
                                    )}
                                    onClick={() => {
                                        if (currentVersion?.id !== version.id) {
                                            handleGoToVersion(version);
                                        }
                                    }}
                                >
                                    <div className="text-sm font-bold">Move</div>
                                    <div className="text-xs text-gray-700">
                                        Will move whole project and changes
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        version.id === selectedVersion?.id
                                            ? '!text-gray-500 !cursor-default'
                                            : 'cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40',
                                        'p-2 flex flex-col'
                                    )}
                                    onClick={() => {
                                        if (version.id !== selectedVersion?.id) {
                                            onVersionSelect(version);
                                        }
                                    }}
                                >
                                    <div className="text-sm font-bold">Preview</div>
                                    <div className="text-xs text-gray-700">
                                        Will only show a preview of the changes without affecting
                                        the TouchDesginer project.
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        version.id === compareVersion?.id ||
                                            version.id === selectedVersion?.id ||
                                            currentVersion?.id === version.id
                                            ? '!text-gray-500 !cursor-default'
                                            : 'cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40',
                                        'p-2 flex flex-col'
                                    )}
                                    onClick={() => {
                                        if (
                                            version.id !== compareVersion?.id &&
                                            version.id !== selectedVersion?.id &&
                                            currentVersion?.id !== version.id
                                        ) {
                                            handleCompareVersionSelect(version);
                                        }
                                    }}
                                >
                                    <div className="text-sm font-bold">Compare</div>
                                    <div className="text-xs text-gray-700">
                                        Will show a preview of the difference between both versions.
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                ))
            )}
        </div>
    );
};

export default History;
