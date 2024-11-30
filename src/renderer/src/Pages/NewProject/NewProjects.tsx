import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import TemplateSelector from '../../components/ui/TemplateSelector';
import ProjectDetailsForm from '../../components/ui/ProjectDetailsForm';
import { localPaths } from '../../const';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import Project from '../../../../main/models/Project';
import Template from '../../../../main/models/Template';
import { motion } from 'framer-motion';
import { ApiResponse } from '../../../../main/errors/ApiResponse';
import { APIErrorCode } from '../../../../main/errors/APIErrorCode';
import DerivativeSpinner from '@renderer/components/ui/DerivativeSpinner';

const NewProject: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        location: string;
        pushOnLoad: boolean;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
    };

    const handleNext = () => {
        if (step === 'select' && selectedTemplate) {
            setStep('form');
        } else if (step === 'form' && formData) {
            handleFormSubmit(formData);
        }
    };

    const handleBack = () => {
        setStep('select');
        setError(null);
        setSuccess(false);
    };

    const handleFormSubmit = (formData: {
        title: string;
        description: string;
        location: string;
        pushOnLoad: boolean;
    }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .createProject(
                formData.location,
                formData.title,
                formData.description,
                formData.pushOnLoad,
                selectedTemplate?.dir
            )
            .then((response: ApiResponse<Project>) => {
                setLoading(false);
                if (response.result) {
                    setSuccess(true);
                    setTimeout(
                        () =>
                            navigate(localPaths.HOME + localPaths.PROJECT_DETAIL, {
                                state: { project: response.result }
                            }),
                        1500
                    );
                } else {
                    switch (response.errorCode!) {
                        case APIErrorCode.EntityAlreadyExists:
                            setError('A project with this name already exists.');
                            break;
                        case APIErrorCode.UnprocessableEntity:
                        case APIErrorCode.BadRequest:
                            setError('The chosen name is invalid. Please select a different name.');
                            break;
                        case APIErrorCode.LocalError:
                            setError(
                                'Failed to create the project. Please verify your TouchDesigner installation and try again.'
                            );
                            break;
                        case APIErrorCode.UnknownError:
                            setError('No internet connection detected for push.');
                            break;
                        default:
                            setError(
                                'Unable to create the project on Mariana Cloud. Please try again later.'
                            );
                    }
                }
            });
    };

    const handleFormUpdate = (data: {
        title: string;
        description: string;
        location: string;
        pushOnLoad: boolean;
    }) => {
        setFormData(data);
        setIsFormValid(data.title?.trim() !== '' && data.location?.trim() !== '');
    };

    return (
        <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full text-white p-8 pt-0 flex flex-col"
        >
            {/* Top-level container to keep Sidebar and Topbar visible */}
            <div className="flex justify-center items-center h-full p-8">
                {/* Show loading spinner if loading */}
                {loading ? (
                    <div className="absolute inset-0 opacity-80 flex justify-center items-center z-20">
                        <DerivativeSpinner />
                    </div>
                ) : (
                    <div className="flex flex-col justify-start bg-gray-800 p-8 rounded-lg shadow-lg overflow-auto no-scrollbar w-full max-w-[1000px] h-fit">
                        <div className="sticky top-0 bg-gray-800 z-10 pb-4">
                            <h1 className="text-2xl font-semibold">
                                {!error &&
                                    (step === 'select' ? 'Select a template' : 'Project Details')}
                            </h1>
                        </div>

                        <div className="flex flex-col items-center justify-center max-h-[90%] w-full">
                            {success ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <AiOutlineCheckCircle className="text-green-500 text-4xl" />
                                    <p className="mt-4 text-xl">Project created successfully!</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <AiOutlineCloseCircle className="text-red-500 text-4xl" />
                                    <p className="mt-4 text-xl">{error}</p>
                                </div>
                            ) : step === 'select' ? (
                                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-700 max-h-[60vh]">
                                    <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                                </div>
                            ) : (
                                <ProjectDetailsForm onFormChange={handleFormUpdate} />
                            )}
                        </div>

                        {!loading && !success && (
                            <div className="flex justify-end items-center gap-4 sticky bottom-0 pt-4 mr-8">
                                {step === 'form' && (
                                    <Button
                                        onClick={handleBack}
                                        className="bg-gray-600 hover:bg-gray-500"
                                    >
                                        Back
                                    </Button>
                                )}
                                {step === 'select' && !error && (
                                    <Button
                                        onClick={() => navigate(-1)}
                                        className="bg-gray-600 hover:bg-gray-500"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    disabled={step === 'select' ? !selectedTemplate : !isFormValid}
                                    onClick={handleNext}
                                    className="bg-blue-700 hover:bg-blue-600"
                                >
                                    {step === 'form' ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default NewProject;
