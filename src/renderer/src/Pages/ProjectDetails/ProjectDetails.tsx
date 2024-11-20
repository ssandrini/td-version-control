import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaArrowDown, FaCheck, FaCloud, FaFolderOpen, FaPlay } from 'react-icons/fa';
import { Version } from '../../../../main/models/Version';
import log from 'electron-log/renderer.js';
import { TDNode } from '../../../../main/models/TDNode';
import { ChangeSet } from '../../../../main/models/ChangeSet';
import Nodes from './Nodes/Nodes';
import { TDState } from '../../../../main/models/TDState';
import DetailsComponent from './DetailsComponent/DetailsComponent';
import Project from '../../../../main/models/Project';
import { TDMergeResult, TDMergeStatus } from '../../../../main/models/TDMergeResult';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { CiWarning } from 'react-icons/ci';
import { Dialog } from '@radix-ui/react-dialog';
import { DialogContent } from '../../components/ui/dialog';
import NodeGraph from './Nodes/NodeGraph/NodeGraph';

const ProjectDetail: React.FC = () => {
    const { toast } = useToast();

    const location = useLocation();
    const project: Project | undefined = location.state?.project;
    const dir = project?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [changes] = useState<ChangeSet<TDNode>>(new ChangeSet<TDNode>());
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [currentState, setCurrentState] = useState<TDState | undefined>(undefined);
    const [compareVersion, setCompareVersion] = useState<Version | null>(null);
    const [compareState, setCompareState] = useState<TDState | undefined>(undefined);
    const [expandDetails, setExpandDetails] = useState<boolean>(false);

    const [mergeConflicts, setMergeConflicts] = useState<
        | {
              currentState: TDState | null;
              incomingState: TDState | null;
          }
        | undefined
    >(undefined);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getCurrentVersion(dir).then((version: Version) => {
            setCurrentVersion(version);
        });
    }, [dir]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .listVersions(dir)
            .then((versions: Version[]) => {
                setVersions(versions);
                if (currentVersion == undefined && versions.length != 0) {
                    setSelectedVersion(versions[0]);
                }
            })
            .catch(() => {
                setVersions([]);
            });
    }, [currentVersion]);

    useEffect(() => {
        if (selectedVersion) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api
                .getState(dir, selectedVersion.id)
                .then((tdState: object) => {
                    const state = TDState.deserialize(tdState);
                    setCurrentState(state);
                })
                .catch((error: any) => {
                    log.error('Error retrieving TDSTATE due to', error);
                });
        }
    }, [selectedVersion]);

    useEffect(() => {
        if (!compareVersion) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .getState(dir, compareVersion?.id)
            .then((tdstate: TDState) => {
                setCompareState(tdstate);
            })
            .catch((error: any) => {
                log.error('Error retrieving TDSTATE due to', error);
            });
    }, [compareVersion]);

    const handlePush = () => {
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

    const handleResolveConflict = (resolvedState: TDState | undefined) => {
        if (!resolvedState) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .finishMerge(project?.path, resolvedState)
            .then((response) => {
                console.log(response);
            })
            .catch((error: any) => {
                console.log(error);
            })
            .finally(() => {
                setMergeConflicts(undefined);
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
    return (
        <div className="bg-gray-800 p-2 flex-col justify-between w-full h-full overflow-auto no-scrollbar">
            {selectedVersion ? (
                <div
                    className="w-full rounded-lg bg-gray-700 cursor-pointer text-white p-4 flex flex-col transition-all duration-600 ease-in-out"
                    onMouseEnter={() => setExpandDetails(true)}
                    onMouseLeave={() => setExpandDetails(false)}
                >
                    <div className="flex flex-row w-full justify-between items-center">
                        <div className="flex flex-col w-full mr-10">
                            <div className="flex flex-row justify-between w-full">
                                <h2 className="text-2xl flex flex-row gap-2">
                                    <div className="font-bold">Project:</div>
                                    {project?.name}
                                </h2>
                                <div className="flex flex-row gap-4">
                                    <Button
                                        className="mr-2 p-2 bg-transparent text-green-500 hover:text-green-400"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayProject(project);
                                        }}
                                    >
                                        <FaPlay />
                                    </Button>
                                    <Button
                                        onClick={() => handleOpenDirectory(project)}
                                        className="mr-2 p-2 bg-transparent"
                                    >
                                        <FaFolderOpen />
                                    </Button>
                                    {project?.remote ? (
                                        <>
                                            <Button
                                                variant="secondary"
                                                className="w-fit flex flex-row gap-2"
                                                onClick={() => handlePush()}
                                            >
                                                <div>Upload changes</div>
                                                <FaCloud />
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="w-fit flex flex-row gap-2"
                                                onClick={() => handlePull()}
                                            >
                                                Refresh project
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="default"
                                                className="w-fit hover:scale-105 transform ease-in-out duration-600 transition-all"
                                                onClick={() => handlePush()}
                                            >
                                                Publish in&nbsp;
                                                <div className="flex font-bold italic">
                                                    Mariana Cloud &copy;
                                                </div>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <h2 className="text-xl flex flex-row gap-2">
                                <div className="font-bold">Version:</div>
                                {selectedVersion.name}
                            </h2>
                            <hr className="border-gray-500 opacity-50 w-full my-1" />
                            <div className="text-xs text-gray-400">{project?.path}</div>
                            <p className="text-gray-400 text-sm mt-1">
                                {selectedVersion.date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </p>
                        </div>
                        <FaArrowDown />
                    </div>
                    {expandDetails && (
                        <DetailsComponent
                            selectedVersion={selectedVersion}
                            setSelectedVersion={setSelectedVersion}
                            setVersions={setVersions}
                            dir={dir}
                            currentVersion={currentVersion}
                            compareVersion={compareVersion}
                            setCompareVersion={setCompareVersion}
                            setCurrentVersion={setCurrentVersion}
                            versions={versions}
                        />
                    )}
                </div>
            ) : (
                <p>Select a version to see details.</p>
            )}
            {mergeConflicts && (
                <Dialog open>
                    <DialogContent className="min-w-[90%] max-w-[90%] w-[90%] min-h-[90%] max-h-[90%] h-[90%] flex flex-col bg-gray-600">
                        <div className="w-full flex flex-row justify-between">
                            <Button
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.currentState ?? undefined
                                    );
                                }}
                            >
                                Resolver
                            </Button>
                            <Button
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.incomingState ?? undefined
                                    );
                                }}
                            >
                                Resolver
                            </Button>
                        </div>
                        <div className="flex flex-row gap-5 w-full h-full">
                            <NodeGraph
                                current={mergeConflicts?.currentState ?? undefined}
                                compare={mergeConflicts?.incomingState ?? undefined}
                            />
                            <NodeGraph
                                current={mergeConflicts?.incomingState ?? undefined}
                                compare={mergeConflicts?.currentState ?? undefined}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            <div className="h-[85%]">
                <Nodes
                    changes={changes}
                    current={currentState}
                    compare={compareState}
                    project={project}
                />
            </div>
        </div>
    );
};

export default ProjectDetail;
