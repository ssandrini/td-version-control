import React from 'react';
import {TD_OPERATOR_TYPES} from '../../const';
import {TDNode} from "../../../../main/models/TDNode";
import {IconType} from "react-icons";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

interface OperatorCardProps {
    node: TDNode;
    Icon?: IconType;
    iconColor?: string;
    compare?: TDNode;
}

const OperatorCard: React.FC<OperatorCardProps> = ({node, Icon, iconColor, compare}) => {
    const getFileImage = (type?: string) => {
        switch (type) {
            case TD_OPERATOR_TYPES.COMPONENT_OPERATOR:
                return 'COMP.png'
            case TD_OPERATOR_TYPES.CHANNEL_OPERATOR:
                return 'CHOP.png'
            case TD_OPERATOR_TYPES.TEXTURE_OPERATOR:
                return 'TOP.png'
            case TD_OPERATOR_TYPES.SURFACE_OPERATOR:
                return 'SOP.png'
            case TD_OPERATOR_TYPES.MATERIAL_OPERATOR:
                return 'MAT.png'
            case TD_OPERATOR_TYPES.DATA_OPERATOR:
                return 'DAT.png'
            default:
                return '/geo.png' // TODO: Add all remaining supported operators.
        }
    };

    return (<Popover>
        <PopoverTrigger className="flex bg-gray-700 rounded-md w-full h-full flex-col items-center">
            <div className="w-full h-full text-white rounded-md p-2 relative flex justify-center items-center">
                <img
                    src={getFileImage(node.type)}
                    alt={node.type}
                    className="w-full h-full object-contain"
                />

                {(Icon && iconColor) && (<Icon className={`absolute bottom-2 left-2 ${iconColor}`}/>)}

                <div className="absolute bottom-2 right-2 bg-gray-700 text-xs px-1 py-0.5 rounded text-yellow-500">
                    {node.type || 'geo'}
                </div>
            </div>
            <p className="text-white mt-2 text-center">{node.name}</p>
        </PopoverTrigger>
        <PopoverContent className="bg-gray-600 border-gray-800 py-2 px-3 flex flex-col text-white w-fit max-h-96">
            <div className="text-h3 mb-1">Propiedades: </div>
            {node.properties && (
                <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                    {Array.from(node.properties).map(([key, value]) => (
                        <div key={key} className="py-1 px-2 bg-gray-200 text-black rounded-lg flex flex-row">
                            {(compare && (compare.properties?.get(key) != value)) ? (
                                <>
                                    {compare?.properties?.get(key) ? (
                                        <>
                                            <div className="font-bold">{key}</div><div className="text-blue-600">: {compare?.properties?.get(key)} -{">"} {value}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="font-bold">{key}</div><div className="text-green-500">: {value}</div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="font-bold">{key}</div>: {value}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </PopoverContent>
    </Popover>);
};

export default OperatorCard;
