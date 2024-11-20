import { FaEdit, FaMinus, FaPlus } from 'react-icons/fa';
import React from 'react';
import { ChangeSet } from '../../../../../../main/models/ChangeSet';
import { TDState } from '../../../../../../main/models/TDState';
import { TDNode } from '../../../../../../main/models/TDNode';
import OperatorCard from '../../../../components/ui/OperatorCard';

interface NodeListProps {
    changes: ChangeSet<TDNode>;
    current: TDState | undefined;
}

const NodeList: React.FC<NodeListProps> = ({ changes, current }) => {
    return (
        <div className="flex flex-col mt-4 bg-gray-800 py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            <div className="text-h2 font-bold text-white p-2 w-full bg-gray-600 rounded-lg">
                Version:
            </div>
            <div className="flex px-4 flex-row gap-3 py-4 flex-wrap">
                {current?.nodes.map((node, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={node} />
                    </div>
                ))}
            </div>
            <div className="text-h2 font-bold text-white p-2 w-full bg-gray-600 rounded-lg">
                Changes:
            </div>
            <div className="flex flex-row gap-3 px-4 py-4 flex-wrap">
                {changes.added.items.map((change, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={change} Icon={FaPlus} iconColor="text-green-500" />
                    </div>
                ))}
                {changes.deleted.items.map((change, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={change} Icon={FaMinus} iconColor="text-red-600" />
                    </div>
                ))}
                {changes.modified.items.map((change, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={change} Icon={FaEdit} iconColor="text-blue-800" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NodeList;
