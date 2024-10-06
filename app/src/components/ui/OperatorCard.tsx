import React from 'react';
import {TD_OPERATOR_TYPES} from '../../const';
import {TDNode} from "../../../electron/models/TDNode";
import {IconType} from "react-icons";

interface OperatorCardProps {
  node: TDNode;
  Icon?: IconType;
  iconColor?: string;
}

const OperatorCard: React.FC<OperatorCardProps> = ({node, Icon, iconColor}) => {
    const getFileImage = (type?: string) => {
        switch (type) {
            case TD_OPERATOR_TYPES.COMPONENT_OPERATOR:
                return '/public/COMP.png'
            case TD_OPERATOR_TYPES.CHANNEL_OPERATOR:
                return '/public/CHOP.png'
            case TD_OPERATOR_TYPES.TEXTURE_OPERATOR:
                return '/public/TOP.png'
            case TD_OPERATOR_TYPES.SURFACE_OPERATOR:
                return '/public/SOP.png'
            case TD_OPERATOR_TYPES.MATERIAL_OPERATOR:
                return '/public/MAT.png'
            case TD_OPERATOR_TYPES.DATA_OPERATOR:
                return '/public/DAT.png'
            default:
                return '/public/geo.png' // TODO: Add all remaining supported operators.
        }
    };

    return (<div className="flex bg-gray-700 rounded-md w-full h-full flex-col items-center">
            <div className="w-full h-full text-white rounded-md p-2 relative flex justify-center items-center">
                <img
                    src={getFileImage(node.type)}
                    alt={node.type}
                    className="w-full h-full object-contain"
                />

                {(Icon && iconColor) && (
                    <Icon className={`absolute bottom-2 left-2 ${iconColor}`}/>
                )}

                <div className="absolute bottom-2 right-2 bg-gray-700 text-xs px-1 py-0.5 rounded text-yellow-500">
                    {node.type || 'geo'}
                </div>
            </div>
            <p className="text-white mt-2 text-center">{node.name}</p>
        </div>);
};

export default OperatorCard;
