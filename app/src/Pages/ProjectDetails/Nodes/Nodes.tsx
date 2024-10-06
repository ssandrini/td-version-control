import React, {useState} from "react";
import {TDNode} from "../../../../electron/models/TDNode";
import {ChangeSet} from "../../../../electron/models/ChangeSet";
import {TDState} from "../../../../electron/models/TDState";
import NodeList from "./NodeList/NodeList";
import {cn} from "../../../lib/utils";
import {FaCircleNodes} from "react-icons/fa6";
import {FaSquare} from "react-icons/fa";
import NodeGraph from "./NodeGraph/NodeGraph";

interface NodesProps {
    changes: ChangeSet<TDNode>
    current: TDState | undefined
}

const Nodes: React.FC<NodesProps> = ({changes, current}) => {
    const [graphViz, setGraphViz] = useState<boolean>(true);

    return (<div
        className="flex flex-col bg-gray-800 py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
        <div
            className="ml-auto flex flex-row p-2 bg-gray-600 w-fit rounded-lg gap-2 transition-all duration-600 ease-in-out">
            <div
                className={cn(graphViz ? "bg-blue-800 text-white" : "text-gray-500", "flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer")}
                onClick={() => {
                    setGraphViz(true)
                }}
            >
                <FaCircleNodes/>
                Graph
            </div>
            <div
                className={cn(!graphViz ? "bg-blue-800 text-white" : "text-gray-500", "flex gap-2 flex-row items-center p-2 rounded-lg cursor-pointer")}
                onClick={() => {
                    setGraphViz(false)
                }}
            >
                <FaSquare/>
                Operator
            </div>
        </div>
        {graphViz ? (<NodeGraph current={current}/>) : (<NodeList changes={changes} current={current}/>)}
    </div>);
}

export default Nodes;