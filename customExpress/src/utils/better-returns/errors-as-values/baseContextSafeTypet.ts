export abstract class ContextSafeType<V>{
    private v: V;
    constructor(v: V) {
        if (this.customValidator(v)) {
            this.v = v;
        }
        else {
            throw new Error(`Invalid value for ${this.constructor.name}: ${v}`);
        }
    }

    public get value(): V { return this.v; }
    abstract customValidator(v: V): boolean
}