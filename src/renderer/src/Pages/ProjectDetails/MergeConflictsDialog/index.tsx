import React, { SetStateAction, useState } from 'react';
import { DialogContent } from '@renderer/components/ui/dialog';
import NodeGraph from '@renderer/Pages/ProjectDetails/Nodes/NodeGraph/NodeGraph';
import { Button } from '@renderer/components/ui/button';
import { IoHelp } from 'react-icons/io5';
import { Dialog } from '@radix-ui/react-dialog';
import { TDState } from '../../../../../main/models/TDState';
import Project from '../../../../../main/models/Project';

interface MergeConflictsDialogProps {
    project?: Project;
    mergeConflicts?:
        | {
              currentState: TDState | null;
              incomingState: TDState | null;
          }
        | undefined;
    setMergeConflicts: React.Dispatch<
        SetStateAction<
            | {
                  currentState: TDState | null;
                  incomingState: TDState | null;
              }
            | undefined
        >
    >;
}

const MergeConflictsDialog: React.FC<MergeConflictsDialogProps> = ({
    project,
    mergeConflicts,
    setMergeConflicts
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

    const handleResolveConflict = (
        resolvedState: TDState | undefined,
        name: string,
        description: string
    ) => {
        if (!resolvedState) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .finishMerge(project?.path, resolvedState, name, description)
            .then((response) => {
                console.log(response);
            })
            .catch((error: any) => {
                console.log(error);
            })
            .finally(() => {
                setMergeConflicts(undefined);
            });
    };

    const handleAbortMerge = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window.api
            .abortMerge(project?.path)
            .then(() => {
                setMergeConflicts(undefined);
                setShowConfirmationDialog(false);
            })
            .catch((error: any) => {
                console.log(error);
            })
            .finally(() => {
                setMergeConflicts(undefined);
            });
    };

    return (
        <>
            {/* Main Merge Conflicts Dialog */}
            <Dialog open>
                <DialogContent className="min-w-[90%] max-w-[90%] w-[90%] min-h-[90%] max-h-[90%] h-[90%] flex flex-col bg-gray-600 items-center">
                    <Button
                        className="absolute right-5 top-5"
                        variant="destructive"
                        onClick={() => setShowConfirmationDialog(true)}
                    >
                        Abort
                    </Button>
                    <div className="w-fit flex flex-col items-center">
                        <div className="w-fit text-[3rem] font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 text-transparent bg-clip-text">
                            Oh no!
                        </div>
                        <div className="text-white">
                            It looks like the changes stored in Mariana Cloud differ from the
                            changes in your computer. Please choose what state to preserve.
                        </div>
                        <div className="text-white font-semibold">
                            You have to leave a name and a description to identify the conflict in
                            the future and give some context to your contributors.
                        </div>
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
                                compare={mergeConflicts?.incomingState ?? undefined}
                            />
                            <Button
                                className="w-1/2 mt-2"
                                disabled={name.length === 0 || description.length === 0}
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.currentState ?? undefined,
                                        name,
                                        description
                                    );
                                }}
                            >
                                Local State
                            </Button>
                        </div>
                        <div className="w-1/2 h-full items-center ml-2 flex flex-col">
                            <NodeGraph
                                current={mergeConflicts?.incomingState ?? undefined}
                                compare={mergeConflicts?.currentState ?? undefined}
                            />
                            <Button
                                className="w-1/2 mt-2"
                                disabled={name.length === 0 || description.length === 0}
                                onClick={() => {
                                    handleResolveConflict(
                                        mergeConflicts?.incomingState ?? undefined,
                                        name,
                                        description
                                    );
                                }}
                            >
                                Cloud State
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
                            Aborting the merge will discard the Cloud state.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowConfirmationDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleAbortMerge}>
                                Abort Merge
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default MergeConflictsDialog;
