import React, { SetStateAction, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { ApiResponse } from '../../../../../../main/errors/ApiResponse';
import { User } from '../../../../../../main/models/api/User';
import Project from '../../../../../../main/models/Project';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';

interface CollaboratorProps {
    project?: Project;
    showModal: boolean;
    setShowModal: React.Dispatch<SetStateAction<boolean>>;
}

const Collaborators: React.FC<CollaboratorProps> = ({ project, showModal, setShowModal }) => {
    const [collaborators, setCollaborators] = useState<User[]>([]);
    const [showAddPopup, setShowAddPopup] = useState<boolean>(false);
    const [searchUsername, setSearchUsername] = useState<string>('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (project?.remote) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api
                .getCollaborators(project.owner ?? '', project.name)
                .then((response: ApiResponse<User[]>) => {
                    if (response.result) {
                        setCollaborators(response.result);
                    } else {
                        setCollaborators([]);
                    }
                });
        }
    }, [project?.remote]);

    const handleRemoveCollaborator = (username: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .removeCollaborator(project?.owner, project?.name, username)
            .then((response: ApiResponse) => {
                if (!response.errorCode) {
                    setCollaborators((prev) =>
                        prev.filter((collaborator) => collaborator.username !== username)
                    );
                }
            });
    };

    useEffect(() => {
        handleSearchUser();
    }, [searchUsername]);

    const handleSearchUser = async () => {
        if (searchUsername.trim() === '') return;

        setLoading(true);
        setError(null);
        setFoundUser(null);

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response: ApiResponse<User> = await window.api.searchUser(searchUsername);

            setLoading(false);
            if (response.result) {
                setFoundUser(response.result);
            } else {
                setError('User not found');
            }
        } catch {
            setLoading(false);
            setError('Connection error. Please try again later.');
        }
    };

    const handleAddCollaborator = () => {
        if (!foundUser) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .addCollaborator(project?.owner, project?.name, foundUser.username, 'write')
            .then((response: ApiResponse) => {
                if (!response.errorCode) {
                    setShowAddPopup(false);
                    setSearchUsername('');
                    setFoundUser(null);
                    setCollaborators((prev) => [...prev, foundUser]);
                }
            });
    };

    return (
        <>
            {showModal && (
                <Dialog open>
                    <DialogContent className="bg-[#1b1d23] w-fit h-fit max-w-[90%] max-h-[90%] flex flex-col items-center justify-start">
                        {collaborators.length > 0 && (
                            <div className="">
                                <h3 className="text-white text-lg mb-2">Collaborators</h3>
                                <div className="flex flex-wrap max-w-[60rem] gap-4">
                                    {collaborators.map((collab, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg"
                                        >
                                            <img
                                                src={collab.avatar_url || '/default-avatar.png'}
                                                alt={`${collab.username}'s avatar`}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="text-white">{collab.username}</span>
                                            <button
                                                onClick={() =>
                                                    handleRemoveCollaborator(collab.username)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex flex-row w-full justify-end items-center gap-3">
                            <button
                                className="bg-white text-black border border-white px-4 py-2 rounded-lg"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                onClick={() => setShowAddPopup(true)}
                            >
                                Add new Collaborator
                            </button>
                        </div>
                        {showAddPopup && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-gray-700 p-6 rounded-lg w-96 max-w-full">
                                    <h3 className="text-white text-lg mb-4">Add Collaborator</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={searchUsername}
                                            onChange={(e) => setSearchUsername(e.target.value)}
                                            placeholder="Enter username"
                                            className="bg-gray-800 text-white p-2 rounded-lg w-full"
                                        />
                                    </div>
                                    {loading && <p className="text-white mb-4">Searching...</p>}
                                    {error && <p className="text-red-500 mb-4">{error}</p>}
                                    {foundUser && (
                                        <div className="flex items-center gap-4 mb-4">
                                            <img
                                                src={foundUser.avatar_url || '/default-avatar.png'}
                                                alt={`${foundUser.username}'s avatar`}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <span className="text-white">{foundUser.username}</span>
                                            {collaborators.find(
                                                (collaborator) =>
                                                    collaborator.username == foundUser.username
                                            ) ? (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveCollaborator(foundUser.username)
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleAddCollaborator}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
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
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default Collaborators;
