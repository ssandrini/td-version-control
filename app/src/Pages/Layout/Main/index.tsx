import React from 'react';

const Main: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-950 to-blue-900 text-white">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold mb-4">Mariana</h1>
                <div className="max-w-lg mx-auto">
                    <p className="text-xl text-gray-300">
                        A version control system designed specifically for TouchDesigner projects.
                    </p>
                </div>
            </div>

            <div className="flex justify-center space-x-16">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="resources/capture.png" alt="Capture icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Capture</h3>
                    <p className="text-sm mt-2 text-gray-300">every step of your creative process.</p>
                </div>
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="resources/recover.png" alt="Recover icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Recover</h3>
                    <p className="text-sm mt-2 text-gray-300">any previous version</p>
                </div>
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="resources/refine.png" alt="Refine icon" className="w-16 h-16"/>
                    </div>
                    <h3 className="text-3xl font-bold">Refine</h3>
                    <p className="text-sm mt-2 text-gray-300">and improve with confidence.</p>
                </div>
            </div>
        </div>
    );
};

export default Main;
