import React, { SetStateAction, useState } from 'react';
import { DialogContent } from '@renderer/components/ui/dialog';
import NodeGraph from '@renderer/Pages/ProjectDetails/Nodes/NodeGraph/NodeGraph';
import { Button } from '@renderer/components/ui/button';
import { IoHelp } from 'react-icons/io5';
import { Dialog } from '@radix-ui/react-dialog';
import { TDState } from '../../../../../main/models/TDState';
import Project from '../../../../../main/models/Project';
import HelpModal from '@renderer/components/ui/helpModal';
import Spinner from '@renderer/components/ui/Spinner';
import { Version } from '../../../../../main/models/Version';

interface MergeConflictsDialogProps {
    project?: Project;
    mergeConflicts?:
        | {
              currentState: TDState | null;
              incomingState: TDState | null;
              commonState: TDState | null;
          }
        | undefined;
    setMergeConflicts: React.Dispatch<
        SetStateAction<
            | {
                  currentState: TDState | null;
                  incomingState: TDState | null;
                  commonState: TDState | null;
              }
            | undefined
        >
    >;
    update?: () => void;
    setWipVersion: React.Dispatch<React.SetStateAction<Version | null>>;
}

const MergeConflictsDialog: React.FC<MergeConflictsDialogProps> = ({
    project,
    mergeConflicts,
    setMergeConflicts,
    update,
    setWipVersion
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isLoadingMerge, setIsLoadingMerge] = useState<boolean>(false);

    const handleResolveConflict = (
        resolvedState: TDState | undefined,
        name: string,
        description: string
    ) => {
        if (!resolvedState) return;

        setIsLoadingMerge(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .finishMerge(project?.path, resolvedState, name, description)
            .then((response) => {
                update && update();
                console.log(response);
            })
            .catch((error: any) => {
                console.log(error);
            })
            .finally(() => {
                setMergeConflicts(undefined);
                setIsLoadingMerge(false);
                setWipVersion(undefined);
            });
    };

    const handleAbortMerge = () => {
        setIsLoadingMerge(true);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .abortMerge(project?.path)
            .then(() => {
                setMergeConflicts(undefined);
                setShowConfirmationDialog(false);
                update && update();
            })
            .catch((error: any) => {
                console.log(error);
            })
            .finally(() => {
                setMergeConflicts(undefined);
                setIsLoadingMerge(false);
                setWipVersion(undefined);
            });
    };

    return (
        <>
            {/* Main Merge Conflicts Dialog */}
            <Dialog open>
                <DialogContent className="min-w-[90%] max-w-[90%] w-[90%] min-h-[90%] max-h-[90%] h-[90%] flex flex-col bg-gray-600 items-center">
                    <div className="absolute right-5 top-5 flex items-center gap-3">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-800 focus:ring-2 focus:ring-white"
                            onClick={openModal}
                            aria-label="Help"
                        >
                            ?
                        </button>
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                            onClick={() => setShowConfirmationDialog(true)}
                            aria-label="Abort"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="w-fit flex flex-col items-center">
                        <div className="w-fit text-[3rem] font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 text-transparent bg-clip-text">
                            Oh no!
                        </div>
                        <div className="text-white">
                            It looks like the changes stored in Mariana Cloud differ from the
                            changes in your computer. Please choose what state to preserve.
                        </div>
                        <div className="text-white font-semibold">
                            Leave a name and description to identify the conflict in the future and
                            give some context to your contributors.
                        </div>
                        <HelpModal isOpen={isModalOpen} onClose={closeModal} />
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <input
                            type="text"
                            placeholder="Final State Name"
                            className="p-2 border border-gray-400 rounded-md bg-gray-700 text-white min-w-[30rem]"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Final Description"
                            className="p-2 border border-gray-400 rounded-md bg-gray-700 text-white min-w-[30rem]"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-center w-full h-full">
                        <div className="w-1/2 h-full mr-2 items-center flex flex-col">
                            <NodeGraph
                                current={mergeConflicts?.currentState ?? undefined}
                                compare={mergeConflicts?.commonState ?? undefined}
                                reference={mergeConflicts?.incomingState ?? undefined}
                            />
                            <Button
                                className="w-1/2 mt-2"
                                disabled={
                                    name.length === 0 || description.length === 0 || isLoadingMerge
                                }
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.currentState ?? undefined,
                                        name,
                                        description
                                    );
                                }}
                            >
                                {isLoadingMerge ? (
                                    <div className="scale-75">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <>{'Local Version'}</>
                                )}
                            </Button>
                        </div>
                        <div className="w-1/2 h-full items-center ml-2 flex flex-col">
                            <NodeGraph
                                current={mergeConflicts?.incomingState ?? undefined}
                                compare={mergeConflicts?.commonState ?? undefined}
                                reference={mergeConflicts?.currentState ?? undefined}
                            />
                            <Button
                                className="w-1/2 mt-2"
                                disabled={
                                    name.length === 0 || description.length === 0 || isLoadingMerge
                                }
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.incomingState ?? undefined,
                                        name,
                                        description
                                    );
                                }}
                            >
                                {isLoadingMerge ? (
                                    <div className="scale-75">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <>{'Cloud Version'}</>
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="text-white flex flex-row items-center gap-2 text-center">
                        <IoHelp />
                        <div className="italic">
                            To avoid these issues in the future, make sure to refresh your local
                            project with Mariana Cloud often!
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            {showConfirmationDialog && (
                <Dialog open>
                    <DialogContent className="w-[30rem] bg-gray-600 rounded-md p-6 flex flex-col items-center">
                        <h2 className="text-2xl text-white font-bold mb-4">
                            Are you sure you want to close?
                        </h2>
                        <p className="text-white mb-6 text-center">
                            Aborting the merge will discard the Cloud Version.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                disabled={isLoadingMerge}
                                onClick={() => setShowConfirmationDialog(false)}
                            >
                                {isLoadingMerge ? (
                                    <div className="scale-75">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <>{'Cancel'}</>
                                )}
                            </Button>
                            <Button
                                disabled={isLoadingMerge}
                                variant="destructive"
                                onClick={handleAbortMerge}
                            >
                                {isLoadingMerge ? (
                                    <div className="scale-75">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <>{'Abort Merge'}</>
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default MergeConflictsDialog;
