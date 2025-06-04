import type { URecord } from "@custom-express/better-standard-library";
import type { z, ZodObject, ZodRawShape } from "zod";

type Pipe<Input extends ZodObject<ZodRawShape>, ReturnType> = {
    input: Input;
    handler: (v: z.infer<Input>) => ReturnType;

};

type Flatten<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends Record<string, unknown> ? Flatten<T[K]> : {};
};

type j = Flatten<{ hi: { ji: string } }>;
// const h: j;
// h;

type Last<T extends readonly any[]> = T extends [...infer _, infer L] ? L : {};

type Client = URecord;

class ClientAdapter<T extends Client> {
    public v: T;
    constructor(v: T) {
        this.v = v;
    }
    react(): {
        flat: {};
        nested: {};
    };
}

// const server = new Server({})
//     .addEntity({
//         name: "hihi",
//         service: EntityBuilder
//             .new()
//             .before({
//                 input: z.object({
//                     ko: z.string()
//                 }),
//                 handler: v => {return {"hi":"f"}}
//             })
//             .addMethod(
//                 "tuturututu",
//                 z.object({ hi: z.string() }),
//                 (v) => {
//                     return "";
//                 },
//             ),
//     });

function g(g, h) {}

class G {
    h = () => { return "h"; };
    j() {}
}

const h = new G();
console.log(h.h.name, h.j.name);

// Example usage
// server.v.hihi.build().methods.tuturututu()
class EntityBuilder<Before extends readonly unknown[]> {
    private state;
    private befores: Before;

    constructor() {

    }

    addAction<T extends ZodObject<ZodRawShape>, Responses>(v: {
        data: z.infer<T> & z.infer<Before[Before["length"]]>;
        handler: (v: T) => void;
    }) {}

    before<T extends ZodObject<ZodRawShape>>(v: {
        data: T;
        handler: (v: z.infer<T>) => void;
    });
}
