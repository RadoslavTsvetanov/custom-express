import { useState } from "react";
/*
* Note: this subcribes to certain fields in indexdb and everytime they are updated even if its not through the hook the state rerenders and although this beghhaviour of not using the hook is supported its not reccomended
*/
class Subscription<Model> {
    private onChange: (v: unknown) => void;

    private v: Model;

    constructor(value: Model, onChange: (v: unknown) => void) {
        this.v = value;
        this.onChange = onChange;
    }

    public get value(): Model {
        return this.value;
    }

    mutate<R>(v: () => R) {
        this.onChange(v());
    }
}

function createSubscription<T>(): Subscription<T> {
    const [state, setState] = useState<T>();
    return new Subscription(state, v => setState(v));
}
