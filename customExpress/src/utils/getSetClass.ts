export class GetSet<V> {
    private v: V;
    constructor(v: V){ this.v = v }
    public getV(): V  {
        return this.v;
    }

    public setV(v: V) {
        this.v = v;
    }
}


export class Get<V> {
    private readonly value: V;
    constructor(v: V) {
        this.value = v
    }
    public get v(){
        return this.value;
    }
}