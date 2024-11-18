import React, {useState} from "react";
import {TDNode} from "../../../../electron/models/TDNode";
import {ChangeSet} from "../../../../electron/models/ChangeSet";
import {TDState} from "../../../../electron/models/TDState";
import NodeList from "./NodeList/NodeList";
import {cn} from "../../../lib/utils";
import {FaCircleNodes} from "react-icons/fa6";
import {FaSquare} from "react-icons/fa";
import NodeGraph from "./NodeGraph/NodeGraph";
import {GoPeople} from "react-icons/go";
import Colaborators from "./Colaborators";
import Project from "../../../../electron/models/Project";

interface NodesProps {
    project?: Project;
    changes: ChangeSet<TDNode>
    current: TDState | undefined
    compare: TDState | undefined
}

const Viz: {
    GRAPH: string,
    SETTINGS: string,
    COLLABORATORS: string,
    CONFLICTS: string,
} = {
    GRAPH: 'GRAPH',
    SETTINGS: 'SETTINGS',
    COLLABORATORS: 'COLLABORATORS',
    CONFLICTS: 'CONFLICTS',
}

const Nodes: React.FC<NodesProps> = ({changes, current, compare, project}) => {
    const [graphViz, setGraphViz] = useState<string>(Viz.GRAPH);

    return (<div
        className="flex flex-col py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700 mx-2">
        <div
            className="ml-auto flex flex-row p-2 bg-gray-600 w-fit rounded-lg gap-2 transition-all duration-600 ease-in-out">
            <div
                className={cn(graphViz == Viz.GRAPH ? "bg-blue-800 text-white" : "text-gray-500", "flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer")}
                onClick={() => {
                    setGraphViz(Viz.GRAPH)
                }}
            >
                <FaCircleNodes/>
                Graph
            </div>
            {project?.remote && (
                <div
                    className={cn(graphViz == Viz.COLLABORATORS ? "bg-blue-800 text-white" : "text-gray-500", "flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer")}
                    onClick={() => {
                        setGraphViz(Viz.COLLABORATORS)
                    }}
                >
                    <GoPeople/>
                    Collaborators
                </div>
            )}
            <div
                className={cn(graphViz == Viz.SETTINGS ? "bg-blue-800 text-white" : "text-gray-500", "flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer")}
                onClick={() => {
                    setGraphViz(Viz.SETTINGS)
                }}
            >
                <FaSquare/>
                Settings
            </div>
        </div>
        {/* Hidden instead of not rendered to avoid re-rendering the ReactFlow diagram each time */}
        <NodeGraph hidden={graphViz != Viz.GRAPH} current={current} compare={compare}/>
        {graphViz != Viz.SETTINGS ? (<></>) : (<NodeList changes={changes} current={current}/>)}
        {graphViz != Viz.COLLABORATORS ? (<></>) : (<Colaborators project={project}/>)}
    </div>);
}

export default Nodes;