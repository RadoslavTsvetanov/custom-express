// Imports
import type { URecord } from "@blazyts/better-standard-library";
import { z, ZodObject, type ZodRawShape } from "zod";

// Utility Types
type Last<T extends readonly any[]> = T extends [...infer _, infer L] ? L : never;

type Flatten<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends Record<string, unknown> ? Flatten<T[K]> : {};
};

// Pipe System
class Pipe<Input, ReturnType> {
    constructor(public handler: (v: Input) => ReturnType) {}
}

class Piper<T extends Pipe<any, any>[]> {
    constructor(public pipes: T) {}

    addPipe<
        Return,
        PrevPipe extends Pipe<any, any> = Last<T>,
        Input extends ReturnType<PrevPipe["handler"]> = ReturnType<PrevPipe["handler"]>
    >(handler: (v: Input) => Return): Piper<[...T, Pipe<Input, Return>]> {
        return new Piper<[...T, Pipe<Input, Return>]>([...this.pipes, new Pipe(handler)]);
    }

    static new<Input, Return>(p: Pipe<Input, Return>): Piper<[Pipe<Input, Return>]> {
        return new Piper<[Pipe<Input, Return>]>([p]);
    }
}

// Example Pipe Usage
const examplePipe = new Pipe(v => []);
const piped = Piper.new(new Pipe((v) => ({ hi: "" } as const))).addPipe(v => {return 7});

// Client Adapter
type Client = URecord;

class ClientAdapter<T extends Client> {
    public v: T;
    constructor(v: T) {
        this.v = v;
    }
    react(): {
        flat: {};
        nested: {};
    } {
        return {
            flat: {},
            nested: {},
        };
    }
}

// Entity Builder
class EntityBuilder<Before extends readonly unknown[] = []> {
    private state;
    private befores: Before;

    constructor() {}

    before<T extends ZodObject<ZodRawShape>>(v: {
        data: T;
        handler: (v: z.infer<T>) => void;
    }) {
        return this; // Optional chaining to enable chaining
    }

    addAction<T extends ZodObject<ZodRawShape>, Responses>(v: {
        data: z.infer<T> & z.infer<Before[Before["length"]]>;
        handler: (v: T) => void;
    }) {
        return this;
    }

    addSubEntity(v: EntityBuilder) {
        return this;
    }
}

// Example EntityBuilder (commented out for optional use)
/*
const server = new Server({})
    .addEntity({
        name: "hihi",
        service: EntityBuilder
            .new()
            .before({
                input: z.object({ ko: z.string() }),
                handler: v => ({ hi: "f" })
            })
            .addMethod(
                "tuturututu",
                z.object({ hi: z.string() }),
                v => ""
            ),
    });
*/

// Miscellaneous Utilities
function g(g: any, h: any) {}

class G {
    h = () => "h";
    j() {}
}

const h = new G();
console.log(h.h.name, h.j.name);

// Example Flatten Usage
type ExampleFlatten = Flatten<{ hi: { ji: string } }>;
// const example: ExampleFlatten;
// example;

// End
