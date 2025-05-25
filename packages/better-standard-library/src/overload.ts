import { z, ZodObject, ZodRawShape } from "zod";
import { map } from "./errors-as-values/mapThatIsLikeInRust";
import { Try } from "./errors-as-values/rust-like-pattern/option";

// type Overloads = 

// type Overloads<>
type OverloadsBase = Record<string, ZodObject<ZodRawShape>>

type OverloadsImplBase<T extends OverloadsBase> = {
    [Overload in keyof T]: (v: z.infer<T[Overload]>) => unknown
}

type OverloadsDefault = OverloadsImplBase<OverloadsBase>

export class FunctionOverload<Y extends OverloadsBase, T extends OverloadsImplBase<Y>> {
    // public overloads
    private overloadsConfig: Y
    private overloads: T
    constructor(overloadsConfig: Y,overloads: T) {
        this.overloadsConfig = overloadsConfig
        this.overloads = overloads
    }
    static new<
            NewOverloads extends Record<
                string,
                ZodObject<ZodRawShape>
            >,
        OverloadsImpl extends OverloadsImplBase<NewOverloads> 
        >
        (
            overloads: NewOverloads,
            overloadsImpl: OverloadsImpl
        ): FunctionOverload<NewOverloads,OverloadsImpl>{
            return new FunctionOverload(overloads, overloadsImpl)
    }

    execute(v: T[keyof T]): ReturnType<T[keyof T]> {
        return Object
                .entries(this.overloadsConfig)
                .map(([name, handler], i) => {
                        if (handler.safeParse(v).success) {// TODO make it strcit so that it must match exactly 
                            return Try(this.overloads[name](v), {
                                ifNone: () => null,
                                ifNotNone: v => v 
                            })
                        } else {
                            return null
                        }
                    })
                .filter(v => v !== null)
                .at(0)
    }

    public get raw(): (v: T[keyof T]) => ReturnType<T[keyof T]> { // just returns the function it is cool when you need to pass just the function instead of the whole object
        return (v: T[keyof T]) => {

            return Object
                .entries(this.overloadsConfig)
                .map(([name, handler], i) => {
                        if (handler.safeParse(v).success) {// TODO make it strcit so that it must match exactly 
                            return Try(this.overloads[name](v), {
                                ifNone: () => null,
                                ifNotNone: v => v 
                            })
                        } else {
                            return null
                        }
                    })
                .filter(v => v !== null)
                .at(0)
        }
    }
}