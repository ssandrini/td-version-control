export enum MergeStatus {
    UP_TO_DATE,
    FINISHED,
    IN_PROGRESS
}

export type Filename = string;
export type Content = string;

export type TrackerMergeResult = {
    mergeStatus: MergeStatus;
    unresolvedConflicts: Map<Filename, Set<[Content, Content]>> | null;
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
