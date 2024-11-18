import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Version} from "../../../../main/models/Version";
import log from "electron-log/renderer.js";
import {TDNode} from "../../../../main/models/TDNode";
import {ChangeSet} from "../../../../main/models/ChangeSet";
import {FaArrowDown, FaCloud} from "react-icons/fa";
import Nodes from "./Nodes/Nodes";
import {TDState} from "../../../../main/models/TDState";
import DetailsComponent from "./DetailsComponent/DetailsComponent";
import Project from "../../../../main/models/Project";
import {TDMergeResult, TDMergeStatus} from "../../../../main/models/TDMergeResult";
import {Button} from "../../components/ui/button";

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const project: Project | undefined = location.state?.project;
    const dir = project?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [changes, _] = useState<ChangeSet<TDNode>>(new ChangeSet<TDNode>());
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [currentState, setCurrentState] = useState<TDState | undefined>(undefined);
    const [compareVersion, setCompareVersion] = useState<Version | null>(null);
    const [compareState, setCompareState] = useState<TDState | undefined>(undefined);
    const [expandDetails, setExpandDetails] = useState<boolean>(false);

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
                    setSelectedVersion(versions[0])
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
                    log.error("Error retrieving TDSTATE due to", error);
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
                log.error("Error retrieving TDSTATE due to", error);
            });
    }, [compareVersion]);

    const handlePush = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .push(project?.path)
            .then(() => {
                log.debug("push ok");
            }).catch(() => {
            log.error("push failed");
        });
    };

    const handlePull = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .pull(project?.path)
            .then((result: TDMergeResult) => {
                if (result.status === TDMergeStatus.FINISHED) {
                    log.debug("pull ok, no hay conflictos")
                } else {
                    log.debug("pull in progress, hay que resolver conflictos");
                }
            }).catch(() => {
            log.error("pull failed");
        });
    };

    return (<div className="bg-gray-800 p-2 flex-col justify-between w-full h-full overflow-auto no-scrollbar">
            {selectedVersion ? (<div
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
                                    {project?.remote ? (
                                        <>
                                            <Button
                                                variant="secondary"
                                                className="w-fit flex flex-row gap-2"
                                                onClick={() => handlePush()}
                                            >
                                                <div>
                                                    Upload changes
                                                </div>
                                                <FaCloud/>
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
                                                className="w-fit"
                                                onClick={() => handlePush()}
                                            >
                                                Publicar en&nbsp;<div className="flex font-bold italic">Mariana Cloud &copy;</div>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <h2 className="text-xl flex flex-row gap-2">
                                <div className="font-bold">Version:</div>
                                {selectedVersion.name}
                            </h2>
                            <hr className="border-gray-500 opacity-50 w-full my-1"/>
                            <div className="text-xs text-gray-400">{project?.path}</div>
                            <p className="text-gray-400 text-sm mt-1">
                                {selectedVersion.date.toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                })}
                            </p>
                        </div>
                        <FaArrowDown/>
                    </div>
                    {expandDetails && (<DetailsComponent
                            selectedVersion={selectedVersion}
                            setSelectedVersion={setSelectedVersion}
                            setVersions={setVersions}
                            dir={dir}
                            currentVersion={currentVersion}
                            compareVersion={compareVersion}
                            setCompareVersion={setCompareVersion}
                            setCurrentVersion={setCurrentVersion}
                            versions={versions}
                        />)}
                </div>) : (<p>Select a version to see details.</p>)}
            <div className="h-[85%]">
                <Nodes changes={changes} current={currentState} compare={compareState} project={project}/>
            </div>
        </div>);
};

export default ProjectDetail;
