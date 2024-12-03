import React, { useEffect, useState } from 'react';
import { FaFolder } from 'react-icons/fa';
import { Checkbox } from './checkbox';
import { useVariableContext } from '@renderer/hooks/Variables/useVariableContext';

interface ProjectDetailsFormProps {
    onFormChange: (formData: {
        title: string;
        description: string;
        location: string;
        pushOnLoad: boolean;
    }) => void;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({ onFormChange }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [pushOnLoad, setPushOnLoad] = useState(false);
    const { defaultProjectLocation } = useVariableContext();

    useEffect(() => {
        onFormChange({
            title: title,
            location: location,
            description: description,
            pushOnLoad: pushOnLoad
        });
    }, [title, location, description, pushOnLoad]);

    useEffect(() => {
        setLocation(defaultProjectLocation);
    }, [defaultProjectLocation]);

    const handleLocationPick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            if (files) {
                setLocation(files.filePaths[0]);
            } else {
                setLocation('');
            }
        });
    };

    return (
        <div className="space-y-6 w-full">
            <div>
                <label className="block text-gray-300 mb-2 text-lg">Project Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                        if (
                            e.target.value.includes(' ') ||
                            e.target.value.includes('\t') ||
                            e.target.value.includes('\n')
                        ) {
                            return;
                        }
                        setTitle(e.target.value);
                    }}
                    className="w-full p-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2 text-lg">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                    rows={5}
                />
            </div>
            <div>
                <label className="block text-gray-300 mb-2 text-lg">Location</label>
                <div className="flex items-center relative">
                    <input
                        type="text"
                        value={location}
                        readOnly
                        onClick={handleLocationPick}
                        className="w-full p-4 bg-gray-700 text-white rounded-lg pr-12 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                    />
                    <FaFolder
                        onClick={handleLocationPick}
                        className="absolute right-4 text-gray-400 hover:text-gray-300 cursor-pointer text-2xl"
                    />
                </div>
            </div>
            <div className="flex items-center">
                <Checkbox
                    id="push_on_load"
                    checked={pushOnLoad}
                    onCheckedChange={(checked) => setPushOnLoad(Boolean(checked))}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-2 border-gray-400 rounded-md"
                />
                <label
                    htmlFor="push_on_load"
                    className="ml-2 text-gray-300 cursor-pointer flex items-center text-lg"
                >
                    Publish in <span className="font-bold italic ml-1">Mariana Cloud &copy;</span>
                </label>
            </div>
        </div>
    );
};

export default ProjectDetailsForm;
