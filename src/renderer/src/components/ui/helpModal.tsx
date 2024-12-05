import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 text-white rounded-lg p-6 max-w-lg w-full border-2 border-gray-600 shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Your project has conflicts!</h1>
                <h2 className="text-lg font-semibold mb-2">What happened?</h2>
                <p className="mb-4">
                    You created a version without getting the last version from the Cloud. Your
                    version conflicts with the Cloud version, and we need your help to move on.
                </p>
                <h2 className="text-lg font-semibold mb-2">How can you fix it?</h2>
                <p className="mb-4">
                    On the left side of your screen, you can see your local version, while on the
                    right you can see the Cloud version.{' '}
                    <span className="text-yellow-400">Highlighted in yellow</span>, you will see the
                    conflicting nodes and their properties. Choose which version (Local or Cloud) to
                    keep, add a name and description to the merged version, and let Mariana handle
                    the rest.
                </p>
                <p className="italic text-sm mb-4">
                    Pro tip: try updating your project more often to avoid this problem in the
                    future!
                </p>

                {/* New Section */}
                <h2 className="text-lg font-semibold mb-2">Not ready to merge yet?</h2>
                <p className="mb-4">
                    Don't worry, if you still want to make changes to your local version, or you
                    want to solve the conflicts later, you can stop it and resume at another time.
                    Keep in mind that the conflict may grow larger the later you solve it!
                </p>

                <button
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded align-right"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default HelpModal;
