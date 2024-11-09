import {TDState} from "./TDState";

export enum TDMergeStatus {
    FINISHED,
    IN_PROGRESS,
}

export class TDMergeResult {
    constructor(public status: TDMergeStatus, public stateA: TDState|null, public stateB: TDState|null) {}

    serialize() : object {
        return this;
    }

    static deserialize(data: any): TDMergeResult {
        return new TDMergeResult(data.status, data.stateA, data.stateB);
    }
}