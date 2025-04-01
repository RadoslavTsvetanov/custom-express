export interface IMapable<T> {
    map<V>(func: (v: T) => V): V
}


export class Mapable<T> implements IMapable<T>{
    private v: T 
    constructor(v: T) {
        this.v = v
    }
    map<V>(func: (v: T) => V): V {
        return func(this.v)  
    }
}