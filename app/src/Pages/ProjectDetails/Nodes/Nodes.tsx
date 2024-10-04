import OperatorCard from "../../../components/ui/OperatorCard";
import {FaEdit, FaMinus, FaPlus} from "react-icons/fa";
import React from "react";
import {TDNode} from "../../../../electron/models/TDNode";
import {ChangeSet} from "../../../../electron/models/ChangeSet";

interface NodesProps {
    changes: ChangeSet<TDNode>
}

const Nodes: React.FC<NodesProps> = ({changes}) => {

    return (<div
        className="mt-4 bg-gray-800 p-4 rounded-lg h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
        <div className="flex flex-row gap-3 py-4 flex-wrap">
            {changes.added.items.map((change, index) => (<OperatorCard
                key={index}
                change={change}
                icon={FaPlus}
                iconColor="text-green-500"
            />))}
            {changes.deleted.items.map((change, index) => (<OperatorCard
                key={index}
                change={change}
                icon={FaMinus}
                iconColor="text-red-600"
            />))}
            {changes.modified.items.map((change, index) => (<OperatorCard
                key={index}
                change={change}
                icon={FaEdit}
                iconColor="text-blue-800"
            />))}
        </div>
    </div>);
}

export default Nodes;