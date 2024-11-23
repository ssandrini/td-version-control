import React from 'react';
import { TDState } from '../../../../../../main/models/TDState';
import OperatorCard from '../../../../components/ui/OperatorCard';

interface NodeListProps {
    current: TDState | undefined;
}

const NodeList: React.FC<NodeListProps> = ({ current }) => {
    return (
        <div className="flex flex-col mt-4 py-4 rounded-lg h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            <div className="flex px-4 flex-row gap-3 py-4 flex-wrap">
                {current?.nodes.map((node, index) => (
                    <div key={index} className="h-fit w-28">
                        <OperatorCard node={node} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NodeList;
