import React from 'react';
import {Handle, Position} from '@xyflow/react';
import OperatorCard from "../../../../../components/ui/OperatorCard";

interface OperatorNodeProps {
    data: any;
}

const OperatorNode: React.FC<OperatorNodeProps> = ({data}) => {
    const width = `${data.operator.properties?.get('sizeX') / 20 ?? 1}rem`;
    const height = `${data.operator.properties?.get('sizeY') / 20 ?? 1}rem`;
    return (<>
        <div className="nodrag" style={{width: width, height: height}}>
            <OperatorCard node={data.operator}/>
        </div>
        <Handle type="target" position={Position.Left}/>
        <Handle type="source" position={Position.Right} id="a"/>
        <Handle
            type="source"
            position={Position.Right}
            id="b"
        />
    </>);
}

export default OperatorNode;