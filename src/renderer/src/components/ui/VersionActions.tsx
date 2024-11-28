import React from 'react';
import { FaArrowsAlt, FaEye, FaBalanceScale } from 'react-icons/fa';
import { cn } from '@renderer/lib/utils';

interface VersionActionsProps {
    currentVersion: any;
    version: any;
    selectedVersion: any;
    compareVersion: any;
    handleGoToVersion: (version: any) => void;
    onVersionSelect: (version: any) => void;
    handleCompareVersionSelect: (version: any) => void;
}

const VersionActions: React.FC<VersionActionsProps> = ({
    currentVersion,
    version,
    selectedVersion,
    compareVersion,
    handleGoToVersion,
    onVersionSelect,
    handleCompareVersionSelect
}) => {
    const actions = [
        {
            icon: <FaArrowsAlt />,
            label: 'Move',
            description: 'Will move the whole project and changes.',
            onClick: () => {
                if (currentVersion?.id !== version.id) {
                    handleGoToVersion(version);
                }
            },
            disabled: currentVersion?.id === version.id
        },
        {
            icon: <FaEye />,
            label: 'Preview',
            description:
                'Will only show a preview of the changes without affecting the TouchDesigner project.',
            onClick: () => {
                if (version.id !== selectedVersion?.id) {
                    onVersionSelect(version);
                }
            },
            disabled: version.id === selectedVersion?.id
        },
        {
            icon: (
                <FaBalanceScale
                    className={
                        version.id === compareVersion?.id
                            ? 'text-red-500'
                            : version.id === selectedVersion?.id ||
                                currentVersion?.id === version.id
                              ? 'text-gray-500 cursor-default'
                              : 'text-white'
                    }
                />
            ),
            label: version.id === compareVersion?.id ? 'Unbind' : 'Compare',
            description: 'Will show a preview of the difference between both versions.',
            onClick: () => {
                if (version.id === compareVersion?.id) {
                    handleCompareVersionSelect(null);
                }
                if (
                    version.id !== compareVersion?.id &&
                    version.id !== selectedVersion?.id &&
                    currentVersion?.id !== version.id
                ) {
                    handleCompareVersionSelect(version);
                }
            },
            disabled: version.id === selectedVersion?.id || currentVersion?.id === version.id
        }
    ];

    return (
        <div className="flex flex-row gap-4">
            {actions.map((action, index) => (
                <div
                    key={index}
                    className={cn(
                        action.disabled
                            ? 'text-gray-500 cursor-default'
                            : 'cursor-pointer hover:bg-gray-300 hover:bg-opacity-40',
                        'p-2 flex flex-col items-center rounded-lg relative'
                    )}
                    onClick={action.onClick}
                >
                    <div className="text-lg">{action.icon}</div>
                    <div className="text-sm font-bold">{action.label}</div>
                    {!action.disabled && (
                        <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                            {action.description}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VersionActions;
