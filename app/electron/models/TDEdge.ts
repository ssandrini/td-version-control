export class TDEdge {
    public destination: string;
    public parm: boolean;

    constructor(destination: string, parm: boolean) {
        this.destination = destination;
        this.parm = parm;
    }
}