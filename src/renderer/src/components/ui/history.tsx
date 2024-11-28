import React from 'react';
import HistoryItem from './HistoryItem';
import { Version } from '../../../../main/models/Version';
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
    wipVersion: Version | null;
}

const History: React.FC<HistoryProps> = ({
    versions,
    onVersionSelect,
    currentVersion,
    selectedVersion,
    handleGoToVersion,
    handleCompareVersionSelect,
    compareVersion,
    wipVersion
}) => {
    return (
        <div className="flex flex-col w-full items-center overflow-y-auto no-scrollbar max-h-[90%]">
            {wipVersion && (
                <HistoryItem
                    version={wipVersion}
                    isCurrent={wipVersion.id === currentVersion?.id}
                    isSelected={wipVersion.id === selectedVersion?.id}
                    onVersionSelect={onVersionSelect}
                    currentVersion={currentVersion}
                    selectedVersion={selectedVersion}
                    handleGoToVersion={handleGoToVersion}
                    handleCompareVersionSelect={handleCompareVersionSelect}
                    compareVersion={compareVersion}
                />
            )}
            {versions.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-4">
                    <Skeleton className="w-full h-14 py-4" />
                    <Skeleton className="w-full h-14 py-4" />
                    <Skeleton className="w-full h-14 py-4" />
                    <Skeleton className="w-full h-14 py-4" />
                    <Skeleton className="w-full h-14 py-4" />
                </div>
            ) : (
                versions.map((version) => (
                    <div
                        key={version.name}
                        className="flex w-full flex-col items-center justify-center gap-1"
                    >
                        <HistoryItem
                            version={version}
                            isCurrent={version.id === currentVersion?.id}
                            isSelected={version.id === selectedVersion?.id}
                            onVersionSelect={onVersionSelect}
                            currentVersion={currentVersion}
                            selectedVersion={selectedVersion}
                            handleGoToVersion={handleGoToVersion}
                            handleCompareVersionSelect={handleCompareVersionSelect}
                            compareVersion={compareVersion}
                        />
                    </div>
                ))
            )}
        </div>
    );
};

export default History;
