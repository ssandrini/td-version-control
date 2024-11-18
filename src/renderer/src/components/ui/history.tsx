import React from 'react';
import HistoryItem from "./HistoryItem";
import {Version} from '../../../../main/models/Version'
import {cn} from "../../lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

interface HistoryProps {
    path?: string;
    onVersionSelect: (version: Version) => void;
    handleGoToVersion: (version: Version) => void;
    handleCompareVersionSelect: (version: Version) => void;
    currentVersion: Version | null;
    compareVersion: Version | null;
    selectedVersion: Version | null;
    versions: Version[];
    orange?: boolean
}

const History: React.FC<HistoryProps> = ({versions, onVersionSelect, currentVersion, selectedVersion, orange, handleGoToVersion, handleCompareVersionSelect, compareVersion}) => {
    return (<div className="flex w-full flex-row overflow-auto no-scrollbar">
        {versions.length === 0 ? <p>No versions found.</p> : versions.map((version) => (<Popover
            key={version.name}
        >
            <PopoverTrigger>
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
                        className={cn(currentVersion?.id === version.id ? "!text-gray-500 !cursor-default" : "cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40", "p-2 flex flex-col")}
                        onClick={() => {
                            if (currentVersion?.id !== version.id) {
                                handleGoToVersion(version)
                            }
                        }}
                    >
                        <div className="text-sm font-bold">Move</div>
                        <div className="text-xs text-gray-700">Will move whole project and changes</div>
                    </div>
                    <div
                        className={cn(version.id === selectedVersion?.id ? "!text-gray-500 !cursor-default" : "cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40", "p-2 flex flex-col")}
                        onClick={() => {
                            if (version.id !== selectedVersion?.id) {
                                onVersionSelect(version)
                            }
                        }}
                    >
                        <div className="text-sm font-bold">Preview</div>
                        <div className="text-xs text-gray-700">Will only show a preview of the changes without affecting
                            the TouchDesginer project.
                        </div>
                    </div>
                    <div
                        className={cn(version.id === compareVersion?.id || version.id === selectedVersion?.id || currentVersion?.id === version.id ? "!text-gray-500 !cursor-default" : "cursor-pointer rounded-lg hover:bg-gray-300 hover:bg-opacity-40", "p-2 flex flex-col")}
                        onClick={() => {
                            if (version.id !== compareVersion?.id && version.id !== selectedVersion?.id && currentVersion?.id !== version.id) {
                                handleCompareVersionSelect(version)
                            }
                        }}
                    >
                        <div className="text-sm font-bold">Compare</div>
                        <div className="text-xs text-gray-700">Will show a preview of the difference between both versions.
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>))}
        <div
            className={`flex flex-col flex-grow h-28}`}
        >
            <div
                className={cn("h-14 rounded-lg m-2 transition-colors duration-200", "text-gray-100 px-2 py-1")}>
            </div>
            <div className="w-full mt-auto flex flex-row items-center">
                <div className={cn("w-6 h-6", orange ? 'bg-orange-500' : 'bg-blue-500', "rounded-full")}/>
                <div className={cn("w-full h-1", orange ? "bg-orange-500" : "bg-blue-500")}/>
            </div>
        </div>
    </div>);
};

export default History;
