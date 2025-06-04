import type { z, ZodObject, ZodRawShape } from "zod";

2;

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
