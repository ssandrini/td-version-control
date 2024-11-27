import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './dialog';
import { Button } from './button';
import { ProjectDependencies } from '@renderer/models/ProjectDependencies';
import Spinner from '@renderer/components/ui/Spinner';

interface MissingDependenciesDialogProps {
    missingDependencies: ProjectDependencies[];
    onRecheck: () => Promise<void>;
}

const MissingDependenciesDialog: React.FC<MissingDependenciesDialogProps> = ({
    missingDependencies,
    onRecheck
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRecheck = async () => {
        setIsLoading(true);
        try {
            await onRecheck();
        } finally {
            setIsLoading(false);
        }
    };

    const issues = missingDependencies.map((dependency, index) => {
        switch (dependency) {
            case ProjectDependencies.GIT:
                return (
                    <li key={index} className="mb-4">
                        <p className="text-gray-700">
                            Git is required to use this tool. Please install Git.
                        </p>
                        <a
                            href="https://git-scm.com/downloads"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline mt-2 block"
                        >
                            Download Git
                        </a>
                    </li>
                );
            case ProjectDependencies.TOUCH_DESIGNER_PATH:
                return (
                    <li key={index} className="mb-4">
                        <p className="text-gray-700">
                            TouchDesigner is required to use this tool. Please add TouchDesigner bin
                            folder to PATH variable.
                        </p>
                    </li>
                );
            case ProjectDependencies.TOE_COMMANDS:
                return (
                    <li key={index} className="mb-4">
                        <p className="text-gray-700">
                            Please check your TouchDesigner installation and try again.
                        </p>
                    </li>
                );
            default:
                return null;
        }
    });

    return (
        <Dialog open>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Missing Dependencies</DialogTitle>
                    <DialogDescription>
                        To use the tool correctly, please resolve the following issues:
                    </DialogDescription>
                </DialogHeader>

                <ol className="list-decimal pl-5">{issues}</ol>

                <DialogFooter>
                    <Button type="button" onClick={handleRecheck} disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Retry'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MissingDependenciesDialog;
export { ProjectDependencies };
