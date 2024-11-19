import { TDState } from './TDState';

export enum TDMergeStatus {
    FINISHED,
    IN_PROGRESS
}

export class TDMergeResult {
    constructor(
        public status: TDMergeStatus,
        public currentState: TDState | null,
        public incomingState: TDState | null
    ) {}

    serialize(): object {
        return this;
    }

    static deserialize(data: any): TDMergeResult {
        return new TDMergeResult(data.status, data.currentState, data.incomingState);
    }
}
