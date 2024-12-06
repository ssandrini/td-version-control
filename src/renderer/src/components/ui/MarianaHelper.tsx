import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface MarianaHelperProps {
    animatePulse?: boolean;
    forceOpen?: boolean;
}

const MarianaHelper: React.FC<MarianaHelperProps> = ({ animatePulse, forceOpen }) => {
    const [showMiddleDiv, setShowMiddleDiv] = useState<boolean>(forceOpen ?? false);
    return (
        <div
            className={cn(
                animatePulse ? 'animate-pulse' : '',
                'flex flex-col bg-gradient-to-r from-gray-900 to-gray-950 border border-white p-10 rounded-[2rem] gap-4 justify-between shadow-lg'
            )}
        >
            <div
                className="text-center cursor-pointer"
                onClick={() => setShowMiddleDiv(!showMiddleDiv)}
            ></div>

            {showMiddleDiv && (
                <div className="flex justify-center space-x-16">
                    <div className="text-center animate-fade-in-up delay-300">
                        <div className="flex justify-center mb-4">
                            <img src="capture.png" alt="Capture icon" className="w-16 h-16" />
                        </div>
                        <h3 className="text-3xl font-bold">Capture</h3>
                        <p className="text-sm mt-2 text-gray-300">
                            every step of your creative process.
                        </p>
                    </div>
                    <div className="text-center animate-fade-in-up delay-600">
                        <div className="flex justify-center mb-4">
                            <img src="recover.png" alt="Recover icon" className="w-16 h-16" />
                        </div>
                        <h3 className="text-3xl font-bold">Recover</h3>
                        <p className="text-sm mt-2 text-gray-300">any previous version</p>
                    </div>
                    <div className="text-center animate-fade-in-up delay-900">
                        <div className="flex justify-center mb-4">
                            <img src="refine.png" alt="Refine icon" className="w-16 h-16" />
                        </div>
                        <h3 className="text-3xl font-bold">Refine</h3>
                        <p className="text-sm mt-2 text-gray-300">and improve with confidence.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarianaHelper;
