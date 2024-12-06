export enum MergeStatus {
    UP_TO_DATE,
    FINISHED,
    FINISHED_WITHOUT_CONFLICTS,
    FINISHED_WITHOUT_ACTIONS,
    IN_PROGRESS
}

export enum PushStatus {
    OK,
    FAILED,
    UP_TO_DATE
}

export type Filename = string;
export type Content = string;

export type TrackerMergeResult = {
    mergeStatus: MergeStatus;
    unresolvedConflicts: Map<Filename, Set<[Content, Content]>> | null;
    lastCommonVersion?: string;
};

/*

file1
    <conflictA,conflictB>
    <lineA,lineB>
file2
    <lineA,lineB>
    <lineA,lineB>
    <lineA,lineB>
    <lineA,lineB>
 */

/*

file1
    conflictB
file2
    conflictA
    lineB
    lineA
    lineA

 */
