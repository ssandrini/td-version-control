import React from 'react';
import {FaUserCircle} from 'react-icons/fa';
import {useVariableContext} from "../../hooks/Variables/useVariableContext.tsx";
import {Button} from "../../components/ui/button.tsx"; // Ícono para la foto de perfil

const Profile: React.FC = () => {
    const {touchDesignerLocation, setTouchDesignerLocation} = useVariableContext();

    const handleSetLocation = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.saveTDBinPath(selectedPath);
            setTouchDesignerLocation(selectedPath);
        });        
    }

    return (<div className="flex h-full">
            <div className="flex-1 bg-gray-100 p-8">
                <div className="mx-auto bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center space-x-6">
                        {/* Foto de Perfil */}
                        <div className="w-32 h-32 flex-shrink-0">
                            <div
                                className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-6xl">
                                <FaUserCircle/>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-800">John Doe</h1>
                            <p className="text-gray-600 mt-1">john.doe@example.com</p>
                            <p className="text-gray-600 mt-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur, nisl vitae
                                viverra tincidunt, sapien lorem cursus est, eu consectetur purus eros nec mi.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="border-t-2 border-gray-900 mb-4"></div>
                <div className="flex flex-col gap-3">
                    <div>La ubicacion actual de touch designer es:</div>
                    <div className="font-bold text-blue-400 underline">{touchDesignerLocation}</div>
                    <div>
                        <Button type="button" onClick={handleSetLocation}>Actualizar ubicaccion</Button>
                    </div>
                </div>
            </div>
        </div>);
};

export default Profile;
