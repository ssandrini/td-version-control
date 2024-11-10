import React, { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { FaFolderOpen, FaPlay, FaTrashAlt } from "react-icons/fa";
import { Dialog, DialogFooter, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog.tsx";
import {localPaths} from "../../const";
import log from 'electron-log/renderer';
import Project from "../../../electron/models/Project.ts";

interface ProjectsProps {
    hideHeader?:boolean
}

const Projects: React.FC<ProjectsProps> = ({hideHeader}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(false); // Estado para manejar el loader
    const navigate = useNavigate();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getRecentProjects().then((recentProjects: Project[]) => {
            if (recentProjects && Array.isArray(recentProjects)) {
                setProjects(recentProjects);
            }
        });
    }, []);

    const handleFilePick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
            const projectName = selectedPath.split('\\').pop() || 'Untitled'; // WARNING: EN WINDOWS USO ESA BARRA, EN LINUX/MAC LA OTRA
            const newProject: Project = {
                name: projectName,
                author: "Unknown Author",
                lastModified: new Date().toLocaleDateString(),
                lastVersion: "0.0.1",
                path: selectedPath,
            };
            const projectExists = projects.some(proj => proj.path === selectedPath);
            if (!projectExists) {
                setProjects([...projects, newProject]);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                window.api.saveProject(newProject);
            }
        });
    };

    const handleNewProject = () => {
        navigate(localPaths.HOME + localPaths.NEW_PROJECT);
    };

    const handlePlayProject = async (project: Project) => {
        setLoadingProject(true);
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await window.api.openToe(project.path);
            navigate(localPaths.HOME + localPaths.PROJECT_DETAIL, { state: { project: project } });
        } catch (error) {
            log.error('Unexpected error:', error);
            alert('Error: Ocurrió un problema inesperado al intentar abrir el proyecto.');
        } finally {
            setLoadingProject(false); // Ocultar loader
        }
    };

    const handleDeleteProject = () => {
        if (projectToDelete) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.deleteProject(projectToDelete.path).then(() => {
                setProjects(projects.filter(p => p !== projectToDelete));
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
            });
        }
    };

    const confirmDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleCellClick = (event: MouseEvent, project: Project) => {
        // Prevents the row click if the click is within a button
        if ((event.target as HTMLElement).closest('button')) {
            return;
        }
        navigate(localPaths.HOME + localPaths.PROJECT_DETAIL, { state: { project: project } });
    };

    return (
        <div className="flex w-full overflow-auto h-full">
            {/* Main Content */}
            <div className="flex-1 p-8 text-white">
                {/* Header */}
                {!hideHeader && (
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-semibold">Projects</h2>
                        <div className="flex space-x-4">
                            <Button className="bg-gray-600 hover:bg-gray-500" onClick={handleNewProject}>Create</Button>
                            <Button className="bg-gray-600 hover:bg-gray-500" onClick={handleFilePick}>Open</Button>
                        </div>
                    </div>
                )}

                <div className="overflow-auto">
                    {/* Projects Table or No Projects Message */}
                    {projects.length > 0 ? (
                        <div className="bg-gray-800 rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Last modified
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Last version
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">

                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {projects.map((project, index) => (
                                        <tr
                                            key={index}
                                            onClick={(event) => handleCellClick(event, project)}
                                            className="cursor-pointer hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{project.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{project.lastModified}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{project.lastVersion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Button
                                                    className="mr-2 p-2 bg-transparent text-green-500 hover:text-green-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayProject(project);
                                                    }}
                                                >
                                                    <FaPlay />
                                                </Button>
                                                <Button
                                                    className="p-2 bg-transparent text-red-600 hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteProject(project);
                                                    }}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <FaFolderOpen className="text-6xl text-gray-300 mb-4" />
                            <h1 className="text-2xl text-gray-200 mb-2">No projects, yet</h1>
                            <p className="text-lg text-gray-300">
                                To get started, create or open a project.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <p>Are you sure you want to delete this project?</p>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-500" onClick={handleDeleteProject}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Loader */}
            {loadingProject && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="text-white text-2xl">Loading...</div>
                </div>
            )}
        </div>
    );
};

export default Projects;
