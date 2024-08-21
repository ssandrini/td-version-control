import React from 'react';
import { useVariableContext } from "../../hooks/Variables/useVariableContext.tsx";
import { Button } from "../../components/ui/button.tsx"; // Ícono para la foto de perfil
import log from 'electron-log/renderer';

const Settings: React.FC = () => {
    const { touchDesignerLocation, setTouchDesignerLocation } = useVariableContext();

    const handleSetLocation = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const files = await window.api.filePicker();

            if (files.filePaths.length > 0) {
                const selectedPath = files.filePaths[0];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                await window.api.saveTDBinPath(selectedPath);
                setTouchDesignerLocation(selectedPath);
            } else {
                log.info("No file was selected.");
            }
        } catch (error) {
            log.error("Error selecting file:", error);
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 bg-gray-100 p-8">
                <div className="border-t-2 border-gray-900 mb-4"></div>
                <div className="flex flex-col gap-3">
                    <div>TouchDesigner location:</div>
                    <div className="font-bold text-blue-400 underline">{touchDesignerLocation}</div>
                    <div>
                        <Button type="button" onClick={handleSetLocation}>Update location</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
