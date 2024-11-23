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
    const [showDescription, setShowDescription] = useState<boolean>(false);

    return (
        <div
            className="flex flex-col h-fit items-center"
            onClick={onClick}
            onMouseEnter={() => setShowDescription(true)}
            onMouseLeave={() => setShowDescription(false)}
        >
            <div
                className={cn(
                    isSelected || isCurrent ? 'bg-gray-600' : '',
                    'h-fit rounded-lg m-2 cursor-pointer border border-white hover:bg-gray-600 transform transition-all duration-600 ease-in-out sticky',
                    'text-gray-100 px-2 py-1',
                    'flex flex-col items-center gap-1 justify-center'
                )}
            >
                <div className="w-full text-left flex flex-row gap-0.5 items-center">
                    <FaUserCircle className="text-sm text-gray-300 mr-2" />
                    <div>{version?.author.name ?? '------'}</div>
                </div>
                <div className="w-full text-left flex flex-row gap-0.5 items-center">
                    <FaMailBulk className="text-sm text-gray-300 mr-2" />
                    <div className="italic underline">{version?.author.email ?? '----------'}</div>
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
                <div
                    className={cn(
                        'w-full text-left flex flex-row gap-0.5 items-center overflow-hidden transition-all duration-500 ease-in-out',
                        showDescription ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <FaInfo className="text-sm text-gray-300 mr-2" />
                    <div>{version?.description ?? '------'}</div>
                </div>
            </div>
        </div>
    );
};

export default HistoryItem;
