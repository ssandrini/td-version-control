import React from 'react';
import { Handle, Position } from '@xyflow/react';
import OperatorCard from '../../../../../components/ui/OperatorCard';
import { nodeState } from '../../../../../models/OperatorNodeVariant';
import { FaEdit, FaMinus, FaPlus } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface OperatorNodeProps {
    data: any;
}

const OperatorNode: React.FC<OperatorNodeProps> = ({ data }) => {
    const width = `${data.operator.properties?.get('sizeX') / 20 ?? 1}rem`;
    const height = `${data.operator.properties?.get('sizeY') / 20 ?? 1}rem`;
    let Icon: IconType | undefined = undefined;
    let iconColor: string | undefined = undefined;
    if (data.variant === nodeState.new) {
        Icon = FaPlus;
        iconColor = 'text-green-500';
    } else if (data.variant === nodeState.deleted) {
        Icon = FaMinus;
        iconColor = 'text-red-600';
    } else if (data.variant === nodeState.modified) {
        Icon = FaEdit;
        iconColor = 'text-blue-700';
    } else if (data.variant === nodeState.highlighted) {
        Icon = FaEdit;
        iconColor = 'text-yellow-400';
    }

    return (
        <>
            <div className="nodrag cursor-pointer" style={{ width: width, height: height }}>
                <OperatorCard
                    node={data.operator}
                    Icon={Icon}
                    iconColor={iconColor}
                    compare={data.compare}
                />
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} id="a" />
            <Handle type="source" position={Position.Right} id="b" />
        </>
    );
};

export default OperatorNode;
