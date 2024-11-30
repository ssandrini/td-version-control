import React from 'react';
import HistoryItem from './HistoryItem';
import { Version } from '../../../../main/models/Version';
import { Skeleton } from '@renderer/components/ui/skeleton';
import Project from '../../../../main/models/Project';

interface HistoryProps {
    path?: string;
    project: Project | undefined;
    setSelectedVersion: React.Dispatch<React.SetStateAction<Version | undefined>>;
    setWipVersion: React.Dispatch<React.SetStateAction<Version | null>>;
    onVersionSelect: (version: Version) => void;
    handleGoToVersion: (version: Version) => void;
    handleCompareVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    compareVersion: Version | null;
    selectedVersion?: Version;
    versions: Version[];
    dir: string | undefined;
    wipVersion: Version | null;
    setShowNewVersionModal: (boolean: boolean) => void;
    setCurrentVersion: (version: Version) => void;
}

const History: React.FC<HistoryProps> = ({
    project,
    versions,
    onVersionSelect,
    currentVersion,
    selectedVersion,
    handleGoToVersion,
    handleCompareVersionSelect,
    compareVersion,
    wipVersion,
    setSelectedVersion,
    setWipVersion,
    setShowNewVersionModal,
    setCurrentVersion,
    dir
}) => {
    return (
        <div className="flex flex-col w-full items-center no-scrollbar max-h-[90%]">
            <div className="flex w-full flex-col items-center justify-center gap-1">
                {wipVersion && (
                    <HistoryItem
                        dir={dir}
                        project={project}
                        setSelectedVersion={setSelectedVersion}
                        setWipVersion={setWipVersion}
                        version={wipVersion}
                        versions={versions}
                        isCurrent={wipVersion.id === currentVersion?.id}
                        isSelected={wipVersion.id === selectedVersion?.id}
                        onVersionSelect={onVersionSelect}
                        currentVersion={currentVersion}
                        selectedVersion={selectedVersion}
                        handleGoToVersion={handleGoToVersion}
                        handleCompareVersionSelect={handleCompareVersionSelect}
                        compareVersion={compareVersion}
                        setShowNewVersionModal={setShowNewVersionModal}
                        setCurrentVersion={setCurrentVersion}
                    />
                )}
            </div>
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
                            dir={dir}
                            versions={versions}
                            project={project}
                            setSelectedVersion={setSelectedVersion}
                            setWipVersion={setWipVersion}
                            version={version}
                            isCurrent={version.id === currentVersion?.id}
                            isSelected={version.id === selectedVersion?.id}
                            onVersionSelect={onVersionSelect}
                            currentVersion={currentVersion}
                            selectedVersion={selectedVersion}
                            handleGoToVersion={handleGoToVersion}
                            handleCompareVersionSelect={handleCompareVersionSelect}
                            compareVersion={compareVersion}
                            setCurrentVersion={setCurrentVersion}
                        />
                    </div>
                ))
            )}
        </div>
    );
};

export default History;
