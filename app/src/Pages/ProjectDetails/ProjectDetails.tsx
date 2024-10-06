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

const ProjectDetail: React.FC = () => {
    const location = useLocation();
    const dir = location.state?.path;
    const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [changes, setChanges] = useState<ChangeSet<TDNode>>(new ChangeSet<TDNode>());
    const [currentState, setCurrentState] = useState<TDState | undefined>(undefined);
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .compareVersions(dir, selectedVersion?.id)
            .then((changeSet: ChangeSet<TDNode>) => {
                // log.debug("Change set:", changeSet);
                // log.debug("Added:", changeSet.added.items.map(node => node.toString()));
                // log.debug("Deleted:", changeSet.deleted.items.map(node => node.toString()));
                // log.debug("Modified:", changeSet.modified.items.map(node => node.toString()));
                // const modifiedNode = changeSet.modified.items[0];
                // // JERO TE DEJO UN EJEMPLO DE COMO ACCEDER A LAS PROPERTIES
                // if (modifiedNode && modifiedNode.properties) {
                //     modifiedNode.properties.forEach((value, key) => {
                //         log.debug(`Propiedad: ${key}, Valor: ${value}`);
                //     });
                // }
                setChanges(changeSet);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                log.error("Error retrieving changeset due to", error);
                // TODO handle error
            });


        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .getState(dir, selectedVersion?.id)
            .then((tdstate: TDState) => {
                console.log(tdstate);
                setCurrentState(tdstate);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
                log.error("Error retrieving TDSTATE due to", error);
            });

    }, [selectedVersion]);

    return (<div className="bg-gray-800 p-4 flex-col justify-between w-full h-full overflow-auto no-scrollbar">
        {selectedVersion ? (<div
            className="w-full rounded-lg bg-gray-700 text-white p-6 flex flex-col transition-all duration-600 ease-in-out"
            onMouseEnter={() => setExpandDetails(true)}
            onMouseLeave={() => setExpandDetails(false)}
        >
            <div className="flex flex-row w-full justify-between items-center">
                <div className="flex flex-col">
                    <h2 className="text-2xl">{selectedVersion.name}</h2>
                    <p className="text-center text-gray-400 text-sm mt-1">
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
                setCurrentVersion={setCurrentVersion}
                versions={versions}
            />)}
        </div>) : (<p>Select a version to see details.</p>)}
        <div className="h-[90%]">
            <Nodes changes={changes} current={currentState}/>
        </div>
    </div>);
};

export default ProjectDetail;
