import React, {useEffect, useState} from "react";
import {FaTrash} from "react-icons/fa";
import {ApiResponse} from "../../../../../../main/errors/ApiResponse";
import {User} from "../../../../../../main/models/api/User";
import Project from "../../../../../../main/models/Project";


interface ColaboratorsProps {
    project?: Project;
}


const Colaborators: React.FC<ColaboratorsProps> = ({project}) => {
    const [collaborators, setCollaborators] = useState<User[]>([]);
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [newCollaborator, setNewCollaborator] = useState<string>("");


    useEffect(() => {
        if (project?.remote) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.getCollaborators(project.owner ?? '', project.name)
                .then((response: ApiResponse<User[]>) => {
                    if(response.result) {
                        setCollaborators(response.result);
                    } else {
                        setCollaborators([]);
                        // To do: error?
                    }
                })
        }
    }, [project?.remote]);

    const handleRemoveCollaborator = (username: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .removeCollaborator(project?.owner, project?.name, username)
            .then((response: ApiResponse) => {
                if(!response.errorCode) {
                    setCollaborators((prev) =>
                        prev.filter((collaborator) => collaborator.username !== username)
                    );
                }
                // TO DO: error
            });
    };

    const handleAddCollaborator = () => {
        if (newCollaborator.trim() === "") return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .addCollaborator(project?.owner, project?.name, newCollaborator, "write")
            .then((response: ApiResponse) => {
                if(!response.errorCode) {
                    setShowAddPopup(false);
                    setNewCollaborator("");
                }
                // TO DO: algo falló
            });
    };

    return (<div>
        {collaborators.length > 0 && (
            <div className="mt-4">
                <h3 className="text-white text-lg mb-2">Collaborators</h3>
                <div className="flex flex-wrap gap-4">
                    {collaborators.map((collab, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg"
                        >
                            <img
                                src={collab.avatar_url || "/default-avatar.png"}
                                alt={`${collab.username}'s avatar`}
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-white">{collab.username}</span>
                            <button
                                onClick={() => handleRemoveCollaborator(collab.username)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        <div className="mt-4">
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => setShowAddPopup(true)}
            >
                Add Collaborator
            </button>
        </div>
        {showAddPopup && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-white text-lg mb-2">Add Collaborator</h3>
                    <input
                        type="text"
                        value={newCollaborator}
                        onChange={(e) => setNewCollaborator(e.target.value)}
                        placeholder="Enter username"
                        className="bg-gray-800 text-white p-2 rounded-lg mb-2 w-full"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddCollaborator}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowAddPopup(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>)
}

export default Colaborators;