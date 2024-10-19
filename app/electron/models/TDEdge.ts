export class TDEdge {
    public destination: string;
    public parm: boolean;

    constructor(destination: string, parm: boolean) {
        this.destination = destination;
        this.parm = parm;
    }

    public serialize(): object {
        return {
            destination: this.destination,
            parm: this.parm
        };
    }

    public static deserialize(data: any): TDEdge {
        return new TDEdge(data.destination, data.parm);
    }
}
