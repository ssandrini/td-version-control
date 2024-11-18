import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import TemplateSelector from "../../components/ui/TemplateSelector";
import ProjectDetailsForm from "../../components/ui/ProjectDetailsForm";
import { localPaths } from "../../const";
import { useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import Spinner from "../../components/ui/Spinner";
import Project from "../../../../main/models/Project";
import Template from "../../../../main/models/Template";

const NewProject: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [step, setStep] = useState<"select" | "form">("select");
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ title: string; description: string; location: string, pushOnLoad: boolean } | null>(null);
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

    const handleFormSubmit = (formData: { title: string; description: string; location: string, pushOnLoad: boolean }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.createProject(formData.location, formData.title, formData.pushOnLoad, selectedTemplate?.dir).then((project: Project) => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => navigate(localPaths.HOME + localPaths.PROJECT_DETAIL, {state: {project: project}}), 1500);
        }).catch((err: unknown) => {
            setLoading(false);
            if (Object.prototype.hasOwnProperty.call(err, "message")) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(`Error: ${err.message}`);
            }
        });
    };

    const handleFormUpdate = (data: { title: string; description: string; location: string, pushOnLoad: boolean }) => {
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
