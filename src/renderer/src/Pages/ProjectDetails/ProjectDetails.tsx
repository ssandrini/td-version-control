import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Version } from '../../../../main/models/Version';
import log from 'electron-log/renderer.js';
import Nodes from './Nodes/Nodes';
import { TDState } from '../../../../main/models/TDState';
import HistoryContainer from './HistoryContainer';
import Project from '../../../../main/models/Project';
import { TDMergeResult, TDMergeStatus } from '../../../../main/models/TDMergeResult';
import { cn } from '@renderer/lib/utils';
import { Author } from '../../../../main/models/Author';
import { useVariableContext } from '@renderer/hooks/Variables/useVariableContext';
import { motion } from 'framer-motion';
import ProjectDetailsHeader from '@renderer/Pages/ProjectDetails/ProjectDetailsHeader';
import MergeConflictsDialog from '@renderer/Pages/ProjectDetails/MergeConflictsDialog';

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const project: Project | undefined = location.state?.project;
    const dir = project?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<Version | undefined>(undefined);
    const [currentState, setCurrentState] = useState<TDState | undefined>(undefined);
    const [compareVersion, setCompareVersion] = useState<Version | null>(null);
    const [compareState, setCompareState] = useState<TDState | undefined>(undefined);
    const { user } = useVariableContext();
    const [wipVersion, setWipVersion] = useState<Version | null>(null);
    const [fetch, setFetch] = useState(false);

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
        window.api.watchProject(project?.path).then(() => {
            console.log('watch project: ', project?.path);
        });
        return () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.unwatchProject(project?.path);
        };
    }, []);

    useEffect(() => {
        const handleProjectChanged = () => {
            console.log('CALLBACK');
            const wipVersion = new Version(
                'Work in progress',
                new Author(user?.username ?? '', user?.email ?? ''),
                '[wip]',
                new Date()
            );
            setWipVersion(wipVersion);
            setSelectedVersion(wipVersion);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.onProjectChanged(handleProjectChanged);

        return () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.removeProjectChangedListener();
        };
    }, []);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getCurrentVersion(dir).then((version: Version) => {
            setCurrentVersion(version);
            setFetch(true);
        });
    }, [dir]);

    useEffect(() => {
        if (!currentVersion) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .listVersions(dir)
            .then((versions: Version[]) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                window.api
                    .hasChanges(dir)
                    .then((result: boolean) => {
                        log.info(`Project has ${result ? '' : 'no '}changes`);
                        if (result) {
                            const wipVersion = new Version(
                                'Work in progress',
                                new Author(user?.username ?? '', user?.email ?? ''),
                                '[wip]',
                                new Date()
                            );
                            setWipVersion(wipVersion);
                            setSelectedVersion(wipVersion);
                        } else {
                            if (versions.length != 0) {
                                setSelectedVersion(currentVersion);
                            }
                        }
                        setVersions(versions);
                    })
                    .catch((error: any) => {
                        log.error('Error retrieving change status due to', error);
                    });
            })
            .catch(() => {
                setVersions([]);
            });
    }, [fetch]);

    useEffect(() => {
        if (selectedVersion) {
            console.log('selected version id:', selectedVersion.id);
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getMergeStatus(project?.path).then((result: TDMergeResult) => {
            if (result.status === TDMergeStatus.FINISHED) {
                setMergeConflicts(undefined);
            } else if (result.status === TDMergeStatus.IN_PROGRESS) {
                setMergeConflicts({
                    currentState: result.currentState,
                    incomingState: result.incomingState
                });
            }
        });
    }, []);

    useEffect(() => {
        if (!compareVersion) {
            setCompareState(undefined);
            return;
        }

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

    /*
    const handleDiscardChanges = () => {
        if (!wipVersion) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .discardChanges(project?.path)
            .then(() => {
                setWipVersion(null);
                setSelectedVersion(versions[0]);
            })
            .catch(() => {
            })
            .finally(() => {
            });
    };*/

    return (
        <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1b1d23] flex flex-row justify-between w-full h-full overflow-auto no-scrollbar"
        >
            <div className="h-full p-2 w-[70%]">
                <Nodes current={currentState} compare={compareState} project={project} />
            </div>
            <div className="flex flex-col h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 bg-[#2b2d30] min-w-[30rem] p-4 w-[27%]">
                <ProjectDetailsHeader
                    project={project}
                    selectedVersion={selectedVersion}
                    setMergeConflicts={setMergeConflicts}
                />

                {/*<Button
            onClick={() => handleDiscardChanges()}
            className="mr-2 p-2 bg-transparent text-red-500 hover:bg-red-200"
            title={'Remove Project'}
        >
            <FaTrash className="text-red-500"/>
        </Button>*/}

                {mergeConflicts && (
                    <MergeConflictsDialog
                        project={project}
                        mergeConflicts={mergeConflicts}
                        setMergeConflicts={setMergeConflicts}
                    />
                )}
                <div className="flex flex-row h-full w-full">
                    <div
                        className={cn(
                            'transition-all w-full h-full duration-500 ease-in-out no-scrollbar'
                        )}
                    >
                        <HistoryContainer
                            wipVersion={wipVersion}
                            setWipVersion={setWipVersion}
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
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProjectDetail;
