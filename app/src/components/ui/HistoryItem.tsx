import React from 'react';
import {Version} from '../../../electron/models/Version.ts'
import {cn} from "../../lib/utils";

interface HistoryItemProps {
    version: Version;
    isCurrent: boolean;
    onClick: () => void;
    isSelected: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({version, isCurrent, onClick, isSelected}) => {
    return (<div
            className={`flex flex-col h-28 min-w-}`}
            onClick={onClick}
        >
            <div className={cn(isSelected ? 'bg-gray-600' : '',  "h-14 rounded-lg m-2 cursor-pointer hover:bg-gray-600 transition-colors duration-200", "text-gray-100 px-2 py-1")}>
                {version.date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })}
            </div>
            <div className="w-full mt-auto flex flex-row items-center">
                <div className={`w-6 h-6 ${isCurrent ? 'bg-gray-200' : 'bg-blue-500'} rounded-full`}/>
                <div className={"w-full h-1 bg-blue-500"}/>
            </div>
        </div>);
};

export default HistoryItem;
