import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import TemplateSelector from "../../components/ui/TemplateSelector";
import Template from "../../models/Template";
import ProjectDetailsForm from "../../components/ui/ProjectDetailsForm";
import Project from "../../models/Project";
import { localPaths } from "../../const";
import { useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import Spinner from "../../components/ui/Spinner";
import { Version } from "../../../electron/models/Version";

const NewProject: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [step, setStep] = useState<"select" | "form">("select");
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ title: string; description: string; location: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
    };

    const handleNext = () => {
        if (step === "select" && selectedTemplate) {
            setStep("form");
        } else if (step === "form" && formData) {
            handleFormSubmit(formData);
        }
    };

    const handleBack = () => {
        setStep("select");
        setError(null);
        setSuccess(false);
    };

    const handleFormSubmit = (formData: { title: string; description: string; location: string }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.createProject(formData.location, selectedTemplate?.dir).then((initialVersion: Version) => {
            setLoading(false);
            const newProject: Project = {
                name: formData.title,
                author: initialVersion.author,
                lastModified: new Date().toLocaleDateString(),
                lastVersion: initialVersion.name,
                path: formData.location,
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window.api.saveProject(newProject).then(() => {
                setSuccess(true);
                setTimeout(() => {
                    navigate(localPaths.HOME + localPaths.PROJECT_DETAIL, { state: { path: newProject.path, projectName: newProject.name } });
                }, 1500);
            });
        }).catch((err) => {
            setLoading(false);
            setError(`Error: ${err.message}`);
        });
    };

    const handleFormUpdate = (data: { title: string; description: string; location: string }) => {
        setFormData(data);
        setIsFormValid(data.title.trim() !== "" && data.location.trim() !== "");
    };

    return (
        <div className="h-full bg-gray-900 text-white p-8 flex flex-col">
            <h1 className="text-2xl font-semibold mb-6">
                {step === "select" ? "Select a template" : "Project Details"}
            </h1>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Spinner />
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <AiOutlineCheckCircle className="text-green-500 text-4xl" />
                        <p className="mt-4 text-xl">Project created successfully!</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <AiOutlineCloseCircle className="text-red-500 text-4xl" />
                        <p className="mt-4 text-xl">{error}</p>
                    </div>
                ) : step === "select" ? (
                    <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                ) : (
                    <ProjectDetailsForm onFormChange={handleFormUpdate} />
                )}
            </div>
            {!loading && !success && (
                <div className="mt-6 flex justify-between">
                    {step === "form" && (
                        <Button onClick={handleBack} className="bg-gray-600 hover:bg-gray-500">
                            Back
                        </Button>
                    )}
                    <Button
                        disabled={step === "select" ? !selectedTemplate : !isFormValid}
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                        {step === "form" ? "Finish" : "Next"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NewProject;
