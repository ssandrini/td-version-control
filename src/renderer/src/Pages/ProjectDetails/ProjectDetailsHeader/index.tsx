import { Button } from '@renderer/components/ui/button';
import { FaCheck, FaCloud, FaFolderOpen, FaPlay } from 'react-icons/fa';
import Spinner from '@renderer/components/ui/Spinner';
import { cn } from '@renderer/lib/utils';
import { Skeleton } from '@renderer/components/ui/skeleton';
import React, { SetStateAction, useState } from 'react';
import { CiWarning } from 'react-icons/ci';
import { TDMergeResult, TDMergeStatus } from '../../../../../main/models/TDMergeResult';
import Project from '../../../../../main/models/Project';
import log from 'electron-log/renderer';
import { Version } from '../../../../../main/models/Version';
import { TDState } from '../../../../../main/models/TDState';
import { useToast } from '@renderer/hooks/use-toast';
import { FaDiagramProject } from 'react-icons/fa6';

interface ProjectDetailsHeaderProps {
    project?: Project;
    currentVersion?: Version | null;
    versions?: Version[];
    selectedVersion?: Version | null;
    currentState?: TDState;
    compareVersion?: Version | null;
    wipVersion?: Version | null;
    compareState?: TDState;
    mergeConflicts?:
        | {
              currentState: TDState | null;
              incomingState: TDState | null;
          }
        | undefined;
    setMergeConflicts: React.Dispatch<
        SetStateAction<
            | {
                  currentState: TDState | null;
                  incomingState: TDState | null;
              }
            | undefined
        >
    >;
}

const ProjectDetailsHeader: React.FC<ProjectDetailsHeaderProps> = ({
    project,
    selectedVersion,
    setMergeConflicts
}) => {
    const { toast } = useToast();

    const [isLoadingPush, setIsLoadingPush] = useState(false);

    const handlePush = () => {
        setIsLoadingPush(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .push(project?.path)
            .then(() => {
                toast({
                    className: '',
                    style: {
                        borderTop: '0.35rem solid transparent',
                        borderBottom: 'transparent',
                        borderRight: 'transparent',
                        borderLeft: 'transparent',
                        borderImage: 'linear-gradient(to right, rgb(10, 27, 182), rgb(0, 0, 255))',
                        borderImageSlice: '1'
                    },
                    description: (
                        <div className="w-full h-full flex flex-row items-start gap-2">
                            <FaCheck className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                            <div className="flex flex-col">
                                <div className="font-p1_bold text-h3">Project uploaded</div>
                                <div className="font-p1_regular">
                                    Your project is now up to date with the cloud.
                                </div>
                            </div>
                        </div>
                    )
                });
            })
            .catch(() => {
                toast({
                    className: '',
                    style: {
                        borderTop: '0.35rem solid transparent',
                        borderBottom: 'transparent',
                        borderRight: 'transparent',
                        borderLeft: 'transparent',
                        borderImage: 'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                        borderImageSlice: '1'
                    },
                    description: (
                        <div className="w-full h-full flex flex-row items-start gap-2">
                            <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                            <div className="flex flex-col">
                                <div className="font-p1_bold text-h3">Error on upload</div>
                                <div className="font-p1_regular">
                                    Please try again or contact the mariana team @
                                    marianamasabra@gmail.com.
                                </div>
                            </div>
                        </div>
                    )
                });
            })
            .finally(() => {
                setIsLoadingPush(false);
            });
    };
    const handlePlayProject = (project: Project | undefined) => {
        if (!project) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.openToe(project.path).catch((error) => {
            log.error('Unexpected error:', error);
            toast({
                className: '',
                style: {
                    borderTop: '0.35rem solid transparent',
                    borderBottom: 'transparent',
                    borderRight: 'transparent',
                    borderLeft: 'transparent',
                    borderImage: 'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                    borderImageSlice: '1'
                },
                description: (
                    <div className="w-full h-full flex flex-row items-start gap-2">
                        <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                        <div className="flex flex-col">
                            <div className="font-p1_bold text-h3">Error on project open</div>
                            <div className="font-p1_regular">
                                Please try again or contact the mariana team @
                                marianamasabra@gmail.com.
                            </div>
                        </div>
                    </div>
                )
            });
        });
    };

    const handleOpenDirectory = (project: Project | undefined) => {
        if (!project) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.openDirectory(project.path).catch((error) => {
            log.error('Unexpected error:', error);
            toast({
                className: '',
                style: {
                    borderTop: '0.35rem solid transparent',
                    borderBottom: 'transparent',
                    borderRight: 'transparent',
                    borderLeft: 'transparent',
                    borderImage: 'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                    borderImageSlice: '1'
                },
                description: (
                    <div className="w-full h-full flex flex-row items-start gap-2">
                        <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                        <div className="flex flex-col">
                            <div className="font-p1_bold text-h3">Error opening directory</div>
                            <div className="font-p1_regular">
                                Please try again or contact support.
                            </div>
                        </div>
                    </div>
                )
            });
        });
    };

    const handlePull = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .pull(project?.path)
            .then((result: TDMergeResult) => {
                if (result.status === TDMergeStatus.UP_TO_DATE) {
                    toast({
                        className: '',
                        style: {
                            borderTop: '0.35rem solid transparent',
                            borderBottom: 'transparent',
                            borderRight: 'transparent',
                            borderLeft: 'transparent',
                            borderImage:
                                'linear-gradient(to right, rgb(10, 27, 182), rgb(0, 0, 255))',
                            borderImageSlice: '1'
                        },
                        description: (
                            <div className="w-full h-full flex flex-row items-start gap-2">
                                <FaCheck className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                                <div className="flex flex-col">
                                    <div className="font-p1_bold text-h3">Project updated</div>
                                    <div className="font-p1_regular">
                                        Already up to date with the cloud.
                                    </div>
                                </div>
                            </div>
                        )
                    });
                }
                if (result.status === TDMergeStatus.FINISHED) {
                    toast({
                        className: '',
                        style: {
                            borderTop: '0.35rem solid transparent',
                            borderBottom: 'transparent',
                            borderRight: 'transparent',
                            borderLeft: 'transparent',
                            borderImage:
                                'linear-gradient(to right, rgb(10, 27, 182), rgb(0, 0, 255))',
                            borderImageSlice: '1'
                        },
                        description: (
                            <div className="w-full h-full flex flex-row items-start gap-2">
                                <FaCheck className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                                <div className="flex flex-col">
                                    <div className="font-p1_bold text-h3">Project updated</div>
                                    <div className="font-p1_regular">
                                        Your project is now up to date with the cloud.
                                    </div>
                                </div>
                            </div>
                        )
                    });
                } else {
                    setMergeConflicts({
                        currentState: result.currentState,
                        incomingState: result.incomingState
                    });
                }
            })
            .catch(() => {
                toast({
                    className: '',
                    style: {
                        borderTop: '0.35rem solid transparent',
                        borderBottom: 'transparent',
                        borderRight: 'transparent',
                        borderLeft: 'transparent',
                        borderImage: 'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                        borderImageSlice: '1'
                    },
                    description: (
                        <div className="w-full h-full flex flex-row items-start gap-2">
                            <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                            <div className="flex flex-col">
                                <div className="font-p1_bold text-h3">Error on update</div>
                                <div className="font-p1_regular">
                                    Please try again or contact the mariana team @
                                    marianamasabra@gmail.com.
                                </div>
                            </div>
                        </div>
                    )
                });
            });
    };

    return (
        <>
            {selectedVersion && project ? (
                <div className="w-full h-fit shadow-lg rounded-lg bg-gradient-to-r via-[rgb(75, 60, 144)] from-[rgb(59,243,197)] to-[rgb(58,42,177)] p-2 text-white flex flex-col transition-all duration-600 ease-in-out">
                    <div className="flex flex-row h-full rounded-lg w-full bg-white justify-between items-center p-3 text-gray-800">
                        <div className="flex flex-col w-full">
                            <div className="flex flex-col-reverse justify-between w-full">
                                <h2 className="w-full text-2xl whitespace-pre-wrap break-words overflow-wrap break-word gap-2">
                                    {project?.name}
                                </h2>
                            </div>
                            <h2 className="text-xl flex items-center font-bold flex-row gap-2">
                                <div className="font-bold">
                                    <FaDiagramProject />
                                </div>
                                <div className="w-full pr-2 whitespace-pre-wrap break-words overflow-wrap break-word">
                                    {selectedVersion?.name}
                                </div>
                            </h2>
                            <hr className="border-gray-500 opacity-50 w-full my-1" />
                            <div className="text-xs">{project?.path}</div>
                            <p className="text-sm mt-1 mb-2">
                                {selectedVersion?.date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </p>
                            {project?.remote ? (
                                <div className="flex flex-row w-full gap-4 items-center justify-center">
                                    <Button
                                        variant="secondary2"
                                        className="w-fit min-w-48 flex flex-row gap-2"
                                        onClick={() => handlePush()}
                                        disabled={isLoadingPush}
                                    >
                                        {isLoadingPush ? (
                                            <div className="scale-75">
                                                <Spinner />
                                            </div>
                                        ) : (
                                            <>
                                                <div>Upload changes</div>
                                                <FaCloud />
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="w-fit flex flex-row gap-2"
                                        onClick={() => handlePull()}
                                    >
                                        Refresh project
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full flex flex-row items-center justify-center">
                                    <Button
                                        variant="default"
                                        className={cn(
                                            'w-fit min-w-48 hover:scale-105 transform ease-in-out duration-600 transition-all'
                                        )}
                                        disabled={isLoadingPush}
                                        onClick={() => handlePush()}
                                    >
                                        {isLoadingPush ? (
                                            <div className="scale-75">
                                                <Spinner white />
                                            </div>
                                        ) : (
                                            <>
                                                Publish in &nbsp;
                                                <div className="flex font-bold italic">
                                                    Mariana Cloud &copy;
                                                </div>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                            <div className="flex w-full items-center justify-center p-1 flex-row gap-4">
                                <Button
                                    className="mr-2 p-2 bg-transparent text-green-500 hover:bg-green-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayProject(project);
                                    }}
                                    title={'Run Project'}
                                >
                                    <FaPlay />
                                </Button>
                                <Button
                                    onClick={() => handleOpenDirectory(project)}
                                    className="mr-2 p-2 bg-transparent text-gray-800 hover:bg-gray-200"
                                    title={'Open folder'}
                                >
                                    <FaFolderOpen />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Skeleton className="w-full h-[12rem] rounded-lg p-4 flex flex-col" />
            )}
        </>
    );
};

export default ProjectDetailsHeader;
