import { Button } from '@renderer/components/ui/button';
import { FaArrowUp, FaCheck, FaCloud, FaFolderOpen, FaPlay, FaSyncAlt } from 'react-icons/fa';
import Spinner from '@renderer/components/ui/Spinner';
import { Skeleton } from '@renderer/components/ui/skeleton';
import React, { SetStateAction, useState } from 'react';
import { CiWarning } from 'react-icons/ci';
import { TDMergeResult, TDMergeStatus } from '../../../../../main/models/TDMergeResult';
import Project from '../../../../../main/models/Project';
import log from 'electron-log/renderer';
import { Version } from '../../../../../main/models/Version';
import { TDState } from '../../../../../main/models/TDState';
import { useToast } from '@renderer/hooks/use-toast';
import { MdPeople } from 'react-icons/md';
import Collaborators from '../Nodes/Collaborators';

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
              commonState: TDState | null;
          }
        | undefined;
    setMergeConflicts: React.Dispatch<
        SetStateAction<
            | {
                  currentState: TDState | null;
                  incomingState: TDState | null;
                  commonState: TDState | null;
              }
            | undefined
        >
    >;
    isPublished: boolean;
    setIsPublished: React.Dispatch<SetStateAction<boolean>>;
}

const ProjectDetailsHeader: React.FC<ProjectDetailsHeaderProps> = ({
    project,
    selectedVersion,
    setMergeConflicts,
    isPublished,
    setIsPublished
}) => {
    const { toast } = useToast();

    const [isLoadingPush, setIsLoadingPush] = useState(false);
    const [isLoadingPull, setIsLoadingPull] = useState(false);
    const [isLoadingPublish, setIsLoadingPublish] = useState(false);

    const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);

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
        window.api.openToe(project.path).catch((error: any) => {
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
        window.api.openDirectory(project.path).catch((error: any) => {
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
        setIsLoadingPull(true);
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
                    return;
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
                        incomingState: result.incomingState,
                        commonState: result.commonState
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
            })
            .finally(() => {
                setIsLoadingPull(false);
            });
    };

    const handlePublish = () => {
        if (!project) {
            return;
        }

        setIsLoadingPublish(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .publish(project.path, project.name, project.description)
            .then(() => {
                setIsPublished(true);
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
                                <div className="font-p1_bold text-h3">Project published!</div>
                                <div className="font-p1_regular">
                                    Project is now available on Mariana Cloud.
                                </div>
                            </div>
                        </div>
                    )
                });
                return;
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
                                <div className="font-p1_bold text-h3">Error publishing</div>
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
                setIsLoadingPublish(false);
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
                            <p className="text-sm flex items-center flex-row gap-2">
                                <div className="w-full pr-2 whitespace-pre-wrap break-words overflow-wrap break-word">
                                    {project?.description}
                                </div>
                            </p>
                            <hr className="border-gray-500 opacity-50 w-full my-1" />
                            {/*<div className="text-xs">{project?.path}</div>*/}
                            {/*<p className="text-sm mt-1 mb-1">
                                {selectedVersion?.date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </p>*/}
                            <div className="flex w-full items-center justify-end p-2 gap-6">
                                <div className="flex items-center gap-6 justify-end">
                                    <div className="flex flex-col items-center text-xs">
                                        <span>Run</span>
                                        <Button
                                            className="p-4 bg-transparent text-green-500 hover:bg-green-200 text-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayProject(project);
                                            }}
                                            title={'Run Project'}
                                        >
                                            <FaPlay size={16} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-center text-xs">
                                        <span>Open</span>
                                        <Button
                                            onClick={() => handleOpenDirectory(project)}
                                            className="p-4 bg-transparent text-gray-800 hover:bg-gray-200 text-lg"
                                            title={'Open folder'}
                                        >
                                            <FaFolderOpen size={16} />
                                        </Button>
                                    </div>
                                    {isPublished ? (
                                        <>
                                            <div className="flex flex-col items-center text-xs">
                                                <span>Publish</span>
                                                <Button
                                                    className="p-4 bg-transparent text-gray-800 hover:bg-gray-200 text-lg"
                                                    onClick={() => handlePush()}
                                                    disabled={isLoadingPush}
                                                    title={'Publish changes to the cloud'}
                                                >
                                                    {isLoadingPush ? (
                                                        <div className="scale-75">
                                                            <Spinner />
                                                        </div>
                                                    ) : (
                                                        <FaArrowUp size={16} />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="flex flex-col items-center text-xs">
                                                <span>Refresh</span>
                                                <Button
                                                    className="p-4 bg-transparent text-gray-800 hover:bg-gray-200 text-lg"
                                                    onClick={() => handlePull()}
                                                    title={'Refresh project with cloud'}
                                                >
                                                    {isLoadingPull ? (
                                                        <div className="scale-75">
                                                            <Spinner />
                                                        </div>
                                                    ) : (
                                                        <FaSyncAlt size={16} />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="flex flex-col items-center text-xs">
                                                <span>Collaborators</span>
                                                <Button
                                                    className="p-4 bg-transparent text-gray-800 hover:bg-gray-200 text-lg"
                                                    onClick={() => setShowCollaboratorsModal(true)}
                                                    title={'Manage collaborators'}
                                                >
                                                    <MdPeople size={16} />
                                                </Button>
                                            </div>
                                            <Collaborators
                                                project={project}
                                                showModal={showCollaboratorsModal}
                                                setShowModal={setShowCollaboratorsModal}
                                            />
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-xs">
                                            <span>Publish</span>
                                            <Button
                                                className="p-4 bg-white text-gray-800 hover:bg-gray-200 text-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePublish();
                                                }}
                                                title={'Publish to Mariana Cloud'}
                                            >
                                                {isLoadingPublish ? (
                                                    <div className="scale-75">
                                                        <Spinner />
                                                    </div>
                                                ) : (
                                                    <FaCloud size={16} />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
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
