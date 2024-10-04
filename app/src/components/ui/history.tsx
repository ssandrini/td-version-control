import React from 'react';
import HistoryItem from "../../Elements/HistoryItem";
import {Version} from '../../../electron/models/Version.ts'
import {cn} from "../../lib/utils";

interface HistoryProps {
    path: string;
    onVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    selectedVersion: Version | null;
    versions: Version[];
}

const History: React.FC<HistoryProps> = ({versions, onVersionSelect, currentVersion, selectedVersion}) => {
    return (<div className="flex w-full flex-row overflow-auto no-scrollbar">
        {versions.length === 0 ? <p>No versions found.</p> : versions.map((version) => (<HistoryItem
            key={version.name}
            version={version}
            isCurrent={version.id === currentVersion?.id}
            isSelected={version.id === selectedVersion?.id}
            onClick={() => onVersionSelect(version)}
        />))}
        <div
            className={`flex flex-col flex-grow h-28}`}
        >
            <div
                className={cn("h-14 rounded-lg m-2 transition-colors duration-200", "text-gray-100 px-2 py-1")}>
            </div>
            <div className="w-full mt-auto flex flex-row items-center">
                <div className={`w-6 h-6 bg-blue-500 rounded-full`}/>
                <div className={"w-full h-1 bg-blue-500"}/>
            </div>
        </div>
    </div>);
};

export default History;
