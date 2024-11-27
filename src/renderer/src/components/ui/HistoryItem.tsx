import React, { useState } from 'react';
import { Version } from '../../../../main/models/Version';
import { cn } from '../../lib/utils';
import { FaCalendar, FaInfo, FaMailBulk, FaUserCircle } from 'react-icons/fa';

interface HistoryItemProps {
    version?: Version;
    isCurrent: boolean;
    onClick?: () => void;
    isSelected: boolean;
    orange?: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ version, isCurrent, onClick, isSelected }) => {
    return (
        <div
            className="flex flex-col h-fit items-center text-nowrap text-ellipsis overflow-hidden w-[20rem]"
            onClick={onClick}
        >
            <div
                className={cn(
                    isSelected || isCurrent ? 'bg-gray-600' : '',
                    'h-fit rounded-lg m-2 cursor-pointer transform transition-all duration-600 ease-in-out sticky',
                    'text-gray-100 px-2 py-1 flex flex-col items-center gap-1 justify-center',
                    'w-[20rem]',
                    version?.id === '[wip]'
                        ? 'border-dashed border-2 border-gray-400'
                        : 'border-solid border-2 border-white'
                )}
            >
                <div className="w-full text-left flex flex-row gap-0.5 items-center">
                    <FaUserCircle className="text-sm text-gray-300 mr-2" />
                    <div>{version?.author.name ?? '------'}</div>
                </div>
                <div className="w-full text-left flex flex-row gap-0.5 items-center">
                    <FaCalendar className="text-sm text-gray-300 mr-2" />
                    <div>
                        {version?.date.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }) ?? '-------'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryItem;
