import React, { useState, useEffect } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import Template from '../../../../main/models/Template';

interface TemplateSelectorProps {
    onTemplateSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateSelect }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [marianaTemplates, setMarianaTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api.getTemplates().then((templates: Template[]) => {
            setMarianaTemplates(templates);
            setLoading(false);
        });
    }, []);

    const handleTemplateClick = (template: Template) => {
        setSelectedTemplateId(template.id);
        onTemplateSelect(template);
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 scrollbar-track-gray-700">
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <ImSpinner2 className="animate-spin text-white text-4xl" />
                    <span className="ml-4 text-white">Loading...</span>
                </div>
            ) : (
                <>
                    {marianaTemplates.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-white">
                            <FaExclamationCircle className="text-4xl" />
                            <span className="ml-4">No templates available.</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {marianaTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => handleTemplateClick(template)}
                                    className={`text-white p-4 rounded-lg cursor-pointer border-2 ${
                                        selectedTemplateId === template.id
                                            ? 'border-blue-500'
                                            : 'border-transparent'
                                    } hover:border-blue-300 transition-colors`}
                                >
                                    <div className="relative w-full h-48 overflow-hidden rounded-md">
                                        <img
                                            src={template.imagePath}
                                            alt={template.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="mt-4 font-semibold text-lg">{template.name}</p>
                                    <p className="mt-2 text-gray-400 text-sm">
                                        {template.description || 'No description available.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TemplateSelector;
