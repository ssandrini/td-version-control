import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCog, FaFolderOpen, FaHome } from 'react-icons/fa';
import { cn } from '../../lib/utils';
import { localPaths } from '../../const';
import { useVariableContext } from '../../hooks/Variables/useVariableContext';
import { CiLogout } from 'react-icons/ci';

interface SidebarProps {
    expanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded }) => {
    const { setUser } = useVariableContext();

    const url = new URL(window.location.href).pathname.split('/')[1];
    const [selected, setSelected] = useState<string>(url);

    useEffect(() => {
        const url = new URL(window.location.href).pathname.split('/')[1];
        setSelected(url);
    }, [window]);

    return (
        <div
            className={cn(
                expanded ? 'w-60' : 'w-16',
                'transition-all overflow-hidden duration-600 ease-in-out h-full bg-[#2b2d30] text-white flex flex-col overflow-y-auto sticky items-top'
            )}
        >
            <div
                className={cn(
                    'flex p-2 flex-col space-y-4 items-center justify-start w-full h-full'
                )}
            >
                <Link
                    to={localPaths.HOME}
                    onClick={() => setSelected(localPaths.HOME)}
                    className={cn(
                        !expanded ? 'h-10 flex items-center justify-center' : '',
                        'rounded hover:bg-gray-700 w-full',
                        selected == localPaths.HOME ? 'bg-gray-600' : ''
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center py-2 w-full',
                            expanded ? 'px-4' : 'justify-center'
                        )}
                    >
                        <FaHome className={cn('text-xl', expanded ? 'mr-3' : '')} />
                        {expanded && 'Home'}
                    </div>
                </Link>
                <Link
                    to={localPaths.HOME + localPaths.PROJECTS}
                    onClick={() => setSelected(localPaths.PROJECTS)}
                    className={cn(
                        !expanded ? 'h-10 flex items-center justify-center' : '',
                        'rounded hover:bg-gray-700 w-full',
                        selected == localPaths.PROJECTS ? 'bg-gray-600' : ''
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center py-2 w-full',
                            expanded ? 'px-4' : 'justify-center'
                        )}
                    >
                        <FaFolderOpen className={cn('text-xl', expanded ? 'mr-3' : '')} />
                        {expanded && 'Projects'}
                    </div>
                </Link>
                <Link
                    to={localPaths.HOME + localPaths.SETTINGS}
                    onClick={() => setSelected(localPaths.SETTINGS)}
                    className={cn(
                        !expanded ? 'h-10 flex items-center justify-center' : '',
                        'rounded hover:bg-gray-700 w-full',
                        selected == localPaths.SETTINGS ? 'bg-gray-600' : ''
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center py-2 w-full',
                            expanded ? 'px-4' : 'justify-center'
                        )}
                    >
                        <FaCog className={cn('text-xl', expanded ? 'mr-3' : '')} />
                        {expanded && 'Settings'}
                    </div>
                </Link>
                <div className="flex h-full w-full">
                    <div
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            window.api.logout().finally(() => {
                                setUser(undefined);
                            });
                        }}
                        className={cn(
                            !expanded ? 'h-10 flex items-center justify-center' : '',
                            'text-red mt-auto hover:cursor-pointer',
                            'rounded hover:bg-red-600 hover:bg-opacity-40 w-full'
                        )}
                    >
                        <div
                            className={cn(
                                'flex items-center py-2 overflow-hidden flex-nowrap text-nowrap',
                                expanded ? 'px-4' : 'justify-center'
                            )}
                        >
                            <CiLogout
                                className={cn(
                                    'text-xl text-red-600 font-bold',
                                    expanded ? 'mr-3' : ''
                                )}
                            />
                            {expanded && 'Log Out'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
