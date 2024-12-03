import React, { MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
    FaCheck,
    FaDownload,
    FaFolderOpen,
    FaPlay,
    FaTrashAlt,
    FaUserCircle
} from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../components/ui/dialog';
import { localPaths } from '../../const';
import log from 'electron-log/renderer.js';
import Project from '../../../../main/models/Project';
import { ApiResponse } from '../../../../main/errors/ApiResponse';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/use-toast';
import { CiWarning } from 'react-icons/ci';
import { useVariableContext } from '../../hooks/Variables/useVariableContext';
import { MdOutlineCloud, MdOutlineCloudOff } from 'react-icons/md';
import { motion } from 'framer-motion';
import { cn } from '@renderer/lib/utils';
import { Input } from '@renderer/components/ui/input';

interface ProjectsProps {
    hideHeader?: boolean;
    ignoreRemote?: boolean;
    setHasProjects?: React.Dispatch<React.SetStateAction<boolean>>;
}

const rowAnimationVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.8, ease: 'easeInOut' }
};

const Projects: React.FC<ProjectsProps> = ({ hideHeader, ignoreRemote, setHasProjects }) => {
    const { toast } = useToast();
    const { user } = useVariableContext();

    const [projects, setProjects] = useState<Project[]>([]);
    const [remoteProjects, setRemoteProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // For filtered projects
    const [searchQuery, setSearchQuery] = useState<string>(''); // For search input
    const [isLoadingRemote, setIsLoadingRemote] = useState<boolean>(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(false);

    const [projectToClone, setProjectToClone] = useState<Project | undefined>(undefined);

    const [reload, setReload] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getRecentProjects().then((recentProjects: Project[]) => {
            if (recentProjects && Array.isArray(recentProjects)) {
                setProjects(recentProjects);
                if (setHasProjects) setHasProjects(recentProjects.length > 0);
            }
        });
        if (!ignoreRemote) {
            setIsLoadingRemote(true);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api
                .getRemoteProjects()
                .then((externalRemoteProjects: ApiResponse<Project[]>) => {
                    if (externalRemoteProjects.errorCode) return;
                    if (
                        externalRemoteProjects.result &&
                        Array.isArray(externalRemoteProjects.result)
                    ) {
                        setRemoteProjects(externalRemoteProjects.result);
                        setFilteredProjects(externalRemoteProjects.result); // Initialize filtered projects
                    }
                })
                .finally(() => {
                    setIsLoadingRemote(false);
                });
        }
    }, [reload]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = remoteProjects.filter(
            (project) =>
                project.name.toLowerCase().includes(query) ||
                project.owner?.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query)
        );

        setFilteredProjects(filtered);
    };

    const handleFilePick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
            const projectName = selectedPath.split('\\').pop() || 'Untitled'; // WARNING: EN WINDOWS USO ESA BARRA, EN LINUX/MAC LA OTRA
            const newProject: Project = {
                name: projectName,
                owner: user!.username,
                path: selectedPath
            };
            const projectExists = projects.some((proj) => proj.path === selectedPath);
            if (!projectExists) {
                setProjects([...projects, newProject]);
                if (setHasProjects) setHasProjects([...projects, newProject].length > 0);
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
                setProjects(projects.filter((p) => p !== projectToDelete));
                if (setHasProjects)
                    setHasProjects(projects.filter((p) => p !== projectToDelete).length > 0);
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

    function handleCloneProject() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .filePicker()
            .then((files) => {
                if (files.filePaths.length > 0) {
                    const selectedPath = files.filePaths[0];
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    window.api
                        .createProject(
                            selectedPath,
                            projectToClone?.name,
                            projectToClone?.description,
                            false,
                            projectToClone?.remote
                        )
                        .then((response) => {
                            if (Object.prototype.hasOwnProperty.call(response, 'errorCode')) {
                                toast({
                                    className: '',
                                    style: {
                                        borderTop: '0.35rem solid transparent',
                                        borderBottom: 'transparent',
                                        borderRight: 'transparent',
                                        borderLeft: 'transparent',
                                        borderImage:
                                            'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                                        borderImageSlice: '1'
                                    },
                                    description: (
                                        <div className="w-full h-full flex flex-row items-start gap-2">
                                            <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                                            <div className="flex flex-col">
                                                <div className="font-p1_bold text-h3">
                                                    Error on download
                                                </div>
                                                <div className="font-p1_regular">
                                                    Please try again or contact the mariana team @
                                                    marianamasabra@gmail.com.
                                                </div>
                                            </div>
                                        </div>
                                    )
                                });
                                return;
                            }
                            setReload(!reload);
                            toast({
                                className: '',
                                style: {
                                    borderTop: '0.35rem solid transparent',
                                    borderBottom: 'transparent',
                                    borderRight: 'transparent',
                                    borderLeft: 'transparent',
                                    borderImage:
                                        'linear-gradient(to right, rgb(10, 27, 182), rgb(0, 0, 255))',
                                    borderImageSlice: '1'
                                },
                                description: (
                                    <div className="w-full h-full flex flex-row items-start gap-2">
                                        <FaCheck className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                                        <div className="flex flex-col">
                                            <div className="font-p1_bold text-h3">
                                                Project downloaded
                                            </div>
                                            <div className="font-p1_regular">
                                                You can now see the project in your &#39;Local
                                                Projects&#39; tab.
                                            </div>
                                        </div>
                                    </div>
                                )
                            });
                        })
                        .catch(() => {
                            toast({
                                className: '',
                                style: {
                                    borderTop: '0.35rem solid transparent',
                                    borderBottom: 'transparent',
                                    borderRight: 'transparent',
                                    borderLeft: 'transparent',
                                    borderImage:
                                        'linear-gradient(to right, rgb(255, 0, 0), rgb(252, 80, 80))',
                                    borderImageSlice: '1'
                                },
                                description: (
                                    <div className="w-full h-full flex flex-row items-start gap-2">
                                        <CiWarning className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full p-2.5 max-w-10 w-10 max-h-8 h-8" />
                                        <div className="flex flex-col">
                                            <div className="font-p1_bold text-h3">
                                                Error on download
                                            </div>
                                            <div className="font-p1_regular">
                                                Please try again or contact the mariana team @
                                                marianamasabra@gmail.com.
                                            </div>
                                        </div>
                                    </div>
                                )
                            });
                        })
                        .finally(() => {
                            setProjectToClone(undefined);
                        });
                } else {
                    setProjectToClone(undefined);
                }
            })
            .catch(() => {
                setProjectToClone(undefined);
            });
    }

    return (
        <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col w-full overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700"
        >
            {/* Main Content */}
            <div className="flex-1 p-8 text-white">
                {/* Header */}
                {!hideHeader && (
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-semibold">Projects</h2>
                        <div className="flex space-x-4">
                            <Button
                                className="bg-gray-600 hover:bg-gray-500"
                                onClick={handleNewProject}
                            >
                                Create
                            </Button>
                            <Button
                                className="bg-gray-600 hover:bg-gray-500"
                                onClick={handleFilePick}
                            >
                                Open
                            </Button>
                        </div>
                    </div>
                )}

                <div
                    className={cn(
                        projects.length != 0
                            ? 'items-center justify-start'
                            : 'items-center justify-center',
                        ignoreRemote
                            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto'
                            : 'flex flex-row flex-wrap',
                        'gap-4 w-full'
                    )}
                >
                    {projects.length > 0 ? (
                        <>
                            {projects.map((project, index) => (
                                <div
                                    className="flex flex-col text-black bg-gradient-to-r via-[rgb(75, 60, 144)] from-[rgb(59,243,197)] to-[rgb(58,42,177)] p-1 shadow-lg rounded-lg cursor-pointer min-w-[20rem] w-fit text-ellipsis overflow-hidden"
                                    key={index}
                                    onClick={(event) => handleCellClick(event, project)}
                                >
                                    <div className="flex bg-gray-200 rounded-lg flex-col pl-3 pb-4 h-full">
                                        <div className="whitespace-nowrap flex flex-row items-center justify-between gap-2 text-ellipsis font-bold text-md">
                                            <div>{project.name.split('/').pop()}</div>
                                            <div className="flex flex-row items-center pt-1">
                                                <Button
                                                    className="mr-2 p-2 bg-transparent hover:bg-green-200 text-green-500 hover:text-green-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayProject(project);
                                                    }}
                                                    title={'Run Project'}
                                                >
                                                    <FaPlay />
                                                </Button>
                                                <Button
                                                    className="mr-2 p-2 bg-transparent hover:bg-red-200 text-red-600 hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteProject(project);
                                                    }}
                                                    title={'Remove Project'}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                                <Button
                                                    className="mr-2 p-2 bg-transparent hover:cursor-default"
                                                    disabled={true}
                                                >
                                                    {project.remote ? (
                                                        <MdOutlineCloud className="text-green-500" />
                                                    ) : (
                                                        <MdOutlineCloudOff className="text-red-600" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex w-full mt-3 flex-row justify-between">
                                            <div className="flex flex-row gap-0.5 items-center text-sm">
                                                <FaUserCircle className="text-sm text-gray-300 mr-2" />
                                                <div className="whitespace-nowrap">
                                                    {project.owner ?? user?.username ?? 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center w-full justify-center">
                            <FaFolderOpen className="text-6xl text-gray-300 mb-4" />
                            <h1 className="text-2xl text-gray-200 mb-2">No projects, yet...</h1>
                        </div>
                    )}
                </div>
            </div>

            {!ignoreRemote && (
                <div className="flex-1 m-8 text-white bg-[#2b2d30] rounded-lg">
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center">
                        <h3 className="font-semibold pl-5">Remote Projects</h3>
                        {/* Search bar for remote projects */}
                        {!ignoreRemote && (
                            <div className="flex flex-col py-4 w-[30rem] max-w-[30%] mb-2 pr-4 min-w-[10rem]">
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name, author, or description..."
                                    className="p-2 border border-gray-400 rounded-md !text-white bg-[#2b2d30]"
                                />
                            </div>
                        )}
                    </div>

                    <div className="overflow-auto">
                        {/* Projects Table or No Projects Message */}
                        {filteredProjects.length > 0 ? (
                            <div className="">
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
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredProjects.map((project, index) => (
                                            <motion.tr
                                                key={index}
                                                variants={rowAnimationVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {project.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {project.owner}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {project.description}
                                                </td>
                                                <td className="py-4 whitespace-nowrap text-center">
                                                    <Button
                                                        className="mr-2 bg-green-500 bg-opacity-40 border border-green-500 w-20 p-2 bg-transparent text-green-500 hover:text-green-400"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProjectToClone(project);
                                                        }}
                                                    >
                                                        {projectToClone?.name === project.name ? (
                                                            <div className="flex justify-center items-center">
                                                                <div
                                                                    className={cn(
                                                                        'animate-spin rounded-full h-8 w-8 border-t-4 border-solid border-green-500'
                                                                    )}
                                                                ></div>
                                                            </div>
                                                        ) : (
                                                            <FaDownload />
                                                        )}
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                {isLoadingRemote ? (
                                    <div className="h-[10rem] flex items-center justify-center">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <FaFolderOpen className="text-6xl text-gray-300 mb-4" />
                                        <h1 className="text-2xl text-gray-200 mb-10">
                                            No remote projects yet
                                        </h1>
                                    </div>
                                )}
                            </>
                        )}
                        {projectToClone && (
                            <Dialog open>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Select location for download</DialogTitle>
                                        <DialogDescription>
                                            Please select a location to store the project. It must
                                            be an empty folder.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setProjectToClone(undefined)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="button" onClick={handleCloneProject}>
                                            Select location
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <p>
                            Are you sure you want to delete this project? This will only delete the
                            project from Mariana. It will not delete it from your files.
                        </p>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-500"
                            onClick={handleDeleteProject}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Loader */}
            {loadingProject && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                    <div className="text-white text-2xl">Loading...</div>
                </div>
            )}
        </motion.div>
    );
};

export default Projects;
