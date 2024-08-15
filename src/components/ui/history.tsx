import React, { useEffect, useState } from 'react';
import HistoryItem from "../../Elements/HistoryItem";
import { Version } from '../../../electron/td-mgr/td-mgr';

interface HistoryProps {
    path: string;
    onVersionSelect: (version: Version) => void;
    currentVersion: string;
    selectedVersion: string;
}

const History: React.FC<HistoryProps> = ({ path, onVersionSelect, currentVersion, selectedVersion}) => {
    const [versions, setVersions] = useState<Version[]>([]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.listVersions(path).then((versions: Version[]) => {
            setVersions(versions);
        }).catch(() => {
            setVersions([]);
        });
    }, [path]);

    return (
        <div>
            {versions.length === 0 ? <p>No versions found.</p> : versions.map((version) => (
                <HistoryItem
                    key={version.name}
                    version={version}
                    isCurrent={version.name === currentVersion}
                    isSelected={version.name === selectedVersion}
                    onClick={() => onVersionSelect(version)}
                />
            ))}
        </div>
    );
};

export default History;
