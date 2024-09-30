import React from 'react';
import { FaPlus, FaMinus, FaEdit } from 'react-icons/fa';
import { TD_OPERATOR_TYPES } from '../../const';

const OperatorCard = ({ change, icon: Icon, iconColor }) => {
  const getFileImage = (type) => {
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
        return '/public/geo.png' // TO DO
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-28 h-32 bg-gray-700 text-white rounded-md p-2 relative flex justify-center items-center">
        <img
          src={getFileImage(change.type)}
          alt={change.type}
          className="w-24 h-28 object-contain"
        />

        <Icon className={`absolute bottom-2 left-2 ${iconColor}`} />

        <div className="absolute bottom-2 right-2 bg-gray-700 text-xs px-1 py-0.5 rounded text-yellow-500">
          {change.type || 'geo'}
        </div>
      </div>

      <p className="text-white mt-2 text-center">{change.name}</p>
    </div>
  );
};

export default OperatorCard;
