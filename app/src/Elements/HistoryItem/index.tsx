import React from 'react';
import {Version} from '../../../electron/models/Version.ts'

interface HistoryItemProps {
    version: Version;
    isCurrent: boolean;
    onClick: () => void;
    isSelected: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ version, isCurrent, onClick, isSelected }) => {
    return (
        <div
            className={`flex flex-row h-20 px-4 ${isSelected? 'bg-gray-600': ''} cursor-pointer hover:bg-gray-600 transition-colors duration-200}`}
            onClick={onClick}
        >
            <div className="flex flex-col h-full items-center">
                <div className={`w-6 h-8 ${isCurrent ? 'bg-yellow-400' : 'bg-blue-500'} rounded-full`} />
                <div className={"w-1 h-full bg-blue-500"} />
            </div>
            <div className="text-black font-bold px-2">
                {version.name}
            </div>
        </div>
    );
};

export default HistoryItem;
