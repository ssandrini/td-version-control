import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Version} from "../../../electron/models/Version.ts";
import log from "electron-log/renderer";
import {TDNode} from "../../../electron/models/TDNode.ts";
import {ChangeSet} from "../../../electron/models/ChangeSet.ts";
import {FaArrowDown} from "react-icons/fa";
import Nodes from "./Nodes/Nodes";
import {TDState} from "../../../electron/models/TDState.ts"
import DetailsComponent from "./DetailsComponent/DetailsComponent";
import Project from "../../../electron/models/Project";

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const project: Project | undefined = location.state?.project;
    const dir = project?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [changes, setChanges] = useState<ChangeSet<TDNode>>(new ChangeSet<TDNode>());

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                log.error("Error retrieving TDSTATE due to", error);
            });
    }, [compareVersion]);

    return (<div className="bg-gray-800 p-2 flex-col justify-between w-full h-full overflow-auto no-scrollbar">
        {selectedVersion ? (<div
            className="w-full rounded-lg bg-gray-700 cursor-pointer text-white p-4 flex flex-col transition-all duration-600 ease-in-out"
            onMouseEnter={() => setExpandDetails(true)}
            onMouseLeave={() => setExpandDetails(false)}
        >
            <div className="flex flex-row w-full justify-between items-center">
                <div className="flex flex-col w-full mr-10">
                    <h2 className="text-2xl flex flex-row gap-2"><div className="font-bold">Project:</div> {project?.name}</h2>
                    <h2 className="text-xl flex flex-row gap-2"><div className="font-bold">Version:</div> {selectedVersion.name}
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
            <Nodes changes={changes} current={currentState} compare={compareState}/>
        </div>
    </div>);
};

export default ProjectDetail;
