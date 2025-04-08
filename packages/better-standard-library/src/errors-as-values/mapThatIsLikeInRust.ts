export interface ITrueMap<T>{
    map<ReturnType>(func: (v: T) => ReturnType): ReturnType 
}

export function map<T, ReturnType>(v: T,func: (v: T) => ReturnType): ReturnType {
    return func(v)
}


export class TrueMap<T> implements ITrueMap<T> {
    private v: T
    constructor(v: T) {
        this.v = v
    }
    map<ReturnType>(func: (v: T) => ReturnType): ReturnType {
        return func(this.v)
    }

    static new<R>(v: R) {
        return new TrueMap<R>(v)
    }
}