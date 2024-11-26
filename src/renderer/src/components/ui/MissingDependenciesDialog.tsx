import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './dialog'; // Asegúrate de importar los componentes del Dialog correctamente.
import { Button } from './button';
import { ProjectDependencies } from '@renderer/models/ProjectDependencies'; // Asegúrate de importar el botón correctamente.

// Props del componente
interface MissingDependenciesDialogProps {
    missingDependencies: ProjectDependencies[];
    onRecheck: () => void;
}

const MissingDependenciesDialog: React.FC<MissingDependenciesDialogProps> = ({
    missingDependencies,
    onRecheck
}) => {
    const gitMissing = missingDependencies.includes(ProjectDependencies.GIT);
    const touchDesignerMissing = missingDependencies.includes(
        ProjectDependencies.TOUCH_DESIGNER_PATH
    );
    const toeCommands = missingDependencies.includes(ProjectDependencies.TOE_COMMANDS);

    return (
        <Dialog open>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Missing Dependencies</DialogTitle>
                    <DialogDescription>
                        To use the tool correctly, please resolve the following issues:
                    </DialogDescription>
                </DialogHeader>

                {gitMissing && (
                    <div className="mb-4">
                        <p className="text-red-500">
                            Git is required to use this tool. Please install Git.
                        </p>
                        <a
                            href="https://git-scm.com/downloads"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                        >
                            Download Git
                        </a>
                    </div>
                )}

                {touchDesignerMissing && (
                    <div className="mb-4">
                        <p className="text-red-500">
                            TouchDesigner is required to use this tool. Please select the location
                            of the TouchDesigner bin folder. Add TouchDesiger to PATH variable
                        </p>
                    </div>
                )}

                {toeCommands && (
                    <div className="mb-4">
                        <p className="text-red-500">
                            TOE Commands not working: check your TouchDesigner installation and try
                            again.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" onClick={onRecheck}>
                        Recheck dependencies
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MissingDependenciesDialog;
export { ProjectDependencies };
