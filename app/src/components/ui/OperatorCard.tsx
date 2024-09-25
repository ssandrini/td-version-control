import React from 'react';
import { FaPlus, FaMinus, FaEdit } from 'react-icons/fa';

const OperatorCard = ({ change, icon: Icon, iconColor }) => {
  const getFileImage = (fileType) => {
    switch (fileType) {
        // HAY QUE REEMPLAZAR ACA LOS FILETYPE CON LOS TIPOS DE DATOS DE TD
      case 'txt':
        return '/path/to/textfile-icon.png';
      case 'pdf':
        return '/path/to/pdffile-icon.png';
      case 'jpg':
      case 'png':
        return '/path/to/imagefile-icon.png';
      default:
        return 'public/geo.png';
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
