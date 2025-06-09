import type { ZodObject, ZodRawShape } from "zod";

import { z } from "zod";

import { Try } from "./errors-as-values/rust-like-pattern/option";

// type Overloads =

// type Overloads<>
type OverloadsBase = Record<string, ZodObject<ZodRawShape>>;

type OverloadsImplBase<T extends OverloadsBase> = {
    [Overload in keyof T]: (v: z.infer<T[Overload]>) => unknown
};

type ZodRawObject = ZodObject<ZodRawShape>;

type OverloadsDefault = OverloadsImplBase<OverloadsBase>;

export class FunctionOverload<Y extends OverloadsBase, T extends OverloadsImplBase<Y>> {
    // public overloads
    private overloadsConfig: Y;
    private overloads: T;
    constructor(overloadsConfig: Y, overloads: T) {
        this.overloadsConfig = overloadsConfig;
        this.overloads = overloads;
    }

    static new<
        NewOverloads extends Record<
            string,
            ZodObject<ZodRawShape>
        >,
        OverloadsImpl extends OverloadsImplBase<NewOverloads>,
    >(
        overloads: NewOverloads,
        overloadsImpl: OverloadsImpl,
    ): FunctionOverload<NewOverloads, OverloadsImpl> {
        return new FunctionOverload(overloads, overloadsImpl);
    }

    execute(v: T[keyof T]): ReturnType<T[keyof T]> {
        return Object
            .entries(this.overloadsConfig)
            .map(([name, handler], i) => {
                if (handler.safeParse(v).success) { // TODO make it strcit so that it must match exactly
                    return Try(this.overloads[name](v), {
                        ifNone: () => null,
                        ifNotNone: v => v,
                    });
                }
                else {
                    return null;
                }
            })
            .filter(v => v !== null)
            .at(0);
    }

    public get raw(): (v: T[keyof T]) => ReturnType<T[keyof T]> { // just returns the function it is cool when you need to pass just the function instead of the whole object
        return (v: T[keyof T]) => {
            return Object
                .entries(this.overloadsConfig)
                .map(([name, handler], i) => {
                    if (handler.safeParse(v).success) { // TODO make it strcit so that it must match exactly
                        return Try(this.overloads[name](v), {
                            ifNone: () => null,
                            ifNotNone: v => v,
                        });
                    }
                    else {
                        return null;
                    }
                })
                .filter(v => v !== null)
                .at(0);
        };
    }
}

{
type Overloader<T extends readonly ZodObject<ZodRawShape>[]> = {
    [K in keyof T]: (v: z.infer<T[K]>) => unknown
};

function overload<
    T extends readonly ZodObject<ZodRawShape>[],
    R extends Overloader<T>,
>(
    v: T,
    d: R,
): <E extends number>(v: Parameters<R[E]>[0]) => ReturnType<R[E]> {}

{
    const exmaple = overload(
        [
            z.object({
                hi: z.string(),
            }),
            z.object({
                koko: z.number(),
            }),
        ] as const, // very importnat to place as const
        [
            (v) => { return ""; },
            (v) => { return 3; },
        ],
    );
    exmaple({ hi: "" });
}
}
{
    type Overload<T extends ZodRawObject, R> = {
        ko: T;
        v: (V: z.infer<T>) => R;
    };
    type Overloader<T extends readonly ZodObject<ZodRawShape>[]> = {
        [K in keyof T]: Overload<T[K], unknown>
    };

    function h<H extends readonly ZodObject<ZodRawShape>[]>(v: Overloader<H>): Overloader<H> {}
    const g = h([
        { ko: z.object({ h: z.string() }), v: (V) => {} },
    ] as const);

    const gg = g[0].v();
}

{
    type Overload<T extends ZodObject<ZodRawShape>, R> = (v: z.infer<T>) => R;
    type Overloads<T extends readonly ZodObject<ZodRawShape>[]> = {
        [K in keyof T]: Overload<T[K], unknown>
    };

    type h = Overloads<[]>;

    function k<T extends ZodRawObject[]>(v: Overloads<T>): Overloads<T> {}
}

{
    type Overload<T extends ZodRawShape> = string;
    function g<T>(v: T): {
        [K in keyof T]: ReturnType<T[K]["func"]>
    } {

    }

    const h = g([
        { func: () => { return ""; } },
        { func: () => { return 1; } },
    ] as const);
}

{
    function hgr<T extends ZodRawObject>(v: T): z.infer<T> {}

    const gff = hgr(z.object({ hi: z.string() }));

    type Overload<T extends ZodObject<ZodRawShape>, R> = (v: z.infer<T>) => R;

    function newOverload<T extends ZodRawObject, R>(v: {
        d: T;
        func: (v: z.infer<T>) => R;
    }): Overload<T, R> {}

    const jj = newOverload({
        d: z.object({ z: z.string() }),
        func: (v) => { return "hi"; },
    });

    const hg = jj({ z: "" });

    function gg<T extends unknown>(v: T): <R extends number>(v: Parameters<T[R]>[0]) => ReturnType<T[R]> {

    }

    // function gg<T extends unknown[]>(v: T): <R extends T[number]>(v: Parameters<R>[0]) => ReturnType<R> {
    //     return
    // }

    const h = gg([
        newOverload({
            d: z.object({ hi: z.string() }),
            func(v) {
                return "g" as const;
            },
        }),
        newOverload({
            d: z.object({ hil: z.number() }),
            func: (v) => { return 1 as const; },
        }), // do not place as const here since it breaks infernce for the param in func making it always be {[x: string]: any}
    ] as const); // if you remove this just know it might stop this from working

    const h6 = h({ hi: "" } as const);
}
