import React from 'react';
import HistoryItem from "../../Elements/HistoryItem";
import {Version} from '../../../electron/models/Version.ts'

interface HistoryProps {
    path: string;
    onVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    selectedVersion: Version | null;
    versions: Version[];
}

const History: React.FC<HistoryProps> = ({versions, onVersionSelect, currentVersion, selectedVersion}) => {
    return (<div>
            {versions.length === 0 ? <p>No versions found.</p> : versions.map((version) => (<HistoryItem
                    key={version.name}
                    version={version}
                    isCurrent={version.id === currentVersion?.id}
                    isSelected={version.id === selectedVersion?.id}
                    onClick={() => onVersionSelect(version)}
                />))}
        </div>);
};

export default History;
