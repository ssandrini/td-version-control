import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "../../components/ui/button";
import {FaFolderOpen} from "react-icons/fa";

interface Project {
    name: string;
    author: string;
    lastModified: string;
    lastVersion: string;
    path: string;
}

const initialProjects: Project[] = [];

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [path, setPath] = useState<string>("");
    const navigate = useNavigate();

    const handleRowClick = (projectName: string) => {
        console.log(path);
        const project = projects.find(p => p.name === projectName);
        if (project) {
            navigate(`/projects`, {state: {path: path, projectName: projectName}});
        }
    };

    const handleFilePick = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.filePicker().then((files) => {
            const selectedPath = files.filePaths[0];
            setPath(selectedPath);
            const projectName = selectedPath.split('\\').pop() || 'Untitled'; // WARNING: EN WINDOWS USO ESA BARRA, EN LINUX/MAC LA OTRA
            const newProject: Project = {
                name: projectName,
                author: "Unknown Author",
                lastModified: new Date().toLocaleDateString(),
                lastVersion: "0.0.1",
                path: selectedPath,
            };
            setProjects([...projects, newProject]);
        });
    };

    const handleNewProject = () => {
        // TO DO: hay que crear un nuevo proyecto.
        handleFilePick();
    };

    return (<div className="flex bg-gray-900 h-full">
        {/* Main Content */}
        <div className="flex-1 p-8 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold">Projects</h2>
                <div className="flex space-x-4">
                    <Button className="bg-gray-600 hover:bg-gray-500" onClick={handleNewProject}>Create</Button>
                    <Button className="bg-gray-600 hover:bg-gray-500" onClick={handleFilePick}>Open</Button>
                </div>
            </div>

            <div className="overflow-auto">
                {/* Projects Table or No Projects Message */}
                {projects.length > 0 ? (<div className="bg-gray-800 rounded-lg shadow">
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
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {projects.map((project, index) => (<tr
                            key={index}
                            onClick={() => handleRowClick(project.name)}
                            className="cursor-pointer hover:bg-gray-700"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                {project.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {project.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {project.lastModified}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {project.lastVersion}
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>) : (<div className="flex flex-col items-center justify-center">
                    <FaFolderOpen className="text-6xl text-gray-300 mb-4"/>
                    <h1 className="text-2xl text-gray-200 mb-2">No projects, yet</h1>
                    <p className="text-lg text-gray-300">
                        To get started, create or open a project.
                    </p>
                </div>)}
            </div>
        </div>
    </div>);
};

export default Projects;
