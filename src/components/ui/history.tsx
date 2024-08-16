import React, { useEffect, useState } from 'react';
import HistoryItem from "../../Elements/HistoryItem";
import { Version } from '../../../electron/td-mgr/td-mgr';

interface HistoryProps {
    path: string;
    onVersionSelect: (version: Version) => void;
    currentVersion: string;
    selectedVersion: string;
    versions: Version[];
}

const History: React.FC<HistoryProps> = ({ versions, onVersionSelect, currentVersion, selectedVersion}) => {
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
