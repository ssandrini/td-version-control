import React from "react";
import log from "electron-log/renderer";
import { useVariableContext } from "../../hooks/Variables/useVariableContext";
import { Button } from "../../components/ui/button";

const Settings: React.FC = () => {
    const { touchDesignerLocation, setTouchDesignerLocation, user } = useVariableContext();

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
        <div className="flex h-full bg-gray-50">
            <div className="max-w-4xl mx-auto my-8 p-6 w-full bg-white rounded-lg shadow-md">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                            <img className={user?.avatarUrl && "w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold"} src={user?.avatarUrl} alt={user?.username?.charAt(0) || "NN"}></img>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-sm text-gray-600">Manage your profile and application settings.</p>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile Information</h2>
                    <div className="bg-gray-100 p-4 rounded-md">
                        <div className="mb-2">
                            <span className="text-gray-600">Username: </span>
                            <span className="font-medium text-gray-800">{user?.username || "N/A"}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-gray-600">Email: </span>
                            <span className="font-medium text-gray-800">{user?.email || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* TouchDesigner Location */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">TouchDesigner Location</h2>
                    <div className="bg-gray-100 p-4 rounded-md">
                        <div className="mb-2">
                            <span className="text-gray-600">Current Location: </span>
                            <span className="font-medium text-blue-500 underline">
                                {touchDesignerLocation || "Not set"}
                            </span>
                        </div>
                        <Button
                            type="button"
                            onClick={handleSetLocation}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Update Location
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-sm text-gray-500 text-center">
                    &copy; {new Date().getFullYear()} Mariana. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Settings;
