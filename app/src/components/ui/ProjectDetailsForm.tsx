import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { FaFolder } from "react-icons/fa";

interface ProjectDetailsFormProps {
  onFormChange: (formData: { title: string; description: string; location: string }) => void;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ onFormChange }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        onFormChange({title: title, location: location, description: description});
    }, [title, location, description]);

    const handleLocationPick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            setLocation(files.filePaths[0]);
        });
    };

    return (
        <div className="bg-gray-900 p-8 rounded-lg">
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Project Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Location</label>
                <div className="flex">
                    <input
                        type="text"
                        value={location}
                        readOnly
                        className="w-full p-2 bg-gray-700 text-white rounded-l"
                    />
                    <Button onClick={handleLocationPick} className="mr-2 p-2 text-gray-500 hover:text-gray-400"><FaFolder /></Button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsForm;
