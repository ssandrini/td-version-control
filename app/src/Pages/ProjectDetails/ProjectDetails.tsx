import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Version} from "../../../electron/models/Version.ts";
import log from "electron-log/renderer";
import {TDNode} from "../../../electron/models/TDNode.ts";
import {ChangeSet} from "../../../electron/models/ChangeSet.ts";
import {FaArrowDown, FaTrash} from "react-icons/fa";
import Nodes from "./Nodes/Nodes";
import {TDState} from "../../../electron/models/TDState.ts";
import DetailsComponent from "./DetailsComponent/DetailsComponent";
import Project from "../../../electron/models/Project";
import {User} from "../../../electron/models/api/User";
import {ApiResponse} from "../../../electron/errors/ApiResponse";
import {TDMergeResult, TDMergeStatus} from "../../../electron/models/TDMergeResult";

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
    const [collaborators, setCollaborators] = useState<User[]>([]);
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [newCollaborator, setNewCollaborator] = useState<string>("");

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

    useEffect(() => {
        if (project?.remote) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.getCollaborators("ssandrini", project.name)
                .then((response: ApiResponse<User[]>) => {
                    if(response.result) {
                        setCollaborators(response.result);
                    } else {
                        setCollaborators([]);
                        // To do: error?
                    }
                })
        }
    }, [project?.remote]);

    const handleRemoveCollaborator = (username: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .removeCollaborator("ssandrini", project?.name, username)
            .then((response: ApiResponse) => {
                if(!response.errorCode) {
                    setCollaborators((prev) =>
                        prev.filter((collaborator) => collaborator.username !== username)
                    );
                }
                // TO DO: error
            });
    };

    const handleAddCollaborator = () => {
        if (newCollaborator.trim() === "") return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .addCollaborator("ssandrini", project?.name, newCollaborator, "write")
            .then((response: ApiResponse) => {
                if(!response.errorCode) {
                    setShowAddPopup(false);
                    setNewCollaborator("");
                }
                // TO DO: algo falló
            });
    };

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
            .then((result : TDMergeResult) => {
                if(result.status === TDMergeStatus.FINISHED) {
                    log.debug("pull ok, no hay conflictos")
                } else {
                    log.debug("pull in progress, hay que resolver conflictos");
                }
            }).catch(() => {
            log.error("pull failed");
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
                            <h2 className="text-2xl flex flex-row gap-2">
                                <div className="font-bold">Project:</div>
                                {project?.name}
                            </h2>
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
                    <button
                        onClick={() => handlePush()}
                        className="text-red-500 hover:text-red-700"
                    >
                        Push
                    </button>
                    <button
                        onClick={() => handlePull()}
                        className="text-red-500 hover:text-red-700"
                    >
                        Pull
                    </button>
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
            <div className="h-[85%]">
                <Nodes changes={changes} current={currentState} compare={compareState}/>
            </div>
            {collaborators.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-white text-lg mb-2">Collaborators</h3>
                    <div className="flex flex-wrap gap-4">
                        {collaborators.map((collab, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg"
                            >
                                <img
                                    src={collab.avatar_url || "/default-avatar.png"}
                                    alt={`${collab.username}'s avatar`}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-white">{collab.username}</span>
                                <button
                                    onClick={() => handleRemoveCollaborator(collab.username)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="mt-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => setShowAddPopup(true)}
                >
                    Add Collaborator
                </button>
            </div>
            {showAddPopup && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white text-lg mb-2">Add Collaborator</h3>
                        <input
                            type="text"
                            value={newCollaborator}
                            onChange={(e) => setNewCollaborator(e.target.value)}
                            placeholder="Enter username"
                            className="bg-gray-800 text-white p-2 rounded-lg mb-2 w-full"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddCollaborator}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddPopup(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
