import type { URecord } from "@custom-express/better-standard-library";
import type { z } from "zod";

type Class<T> = { new(...args: any[]): T };

type Func = (...args: any[]) => any;

type Service<
    T extends {
        methods: Record<string, Func>;
        subServices?: Record<string, Service<any>>;
    },
> = {
    methods: T["methods"];
    subServices?: {
        [K in keyof T["subServices"]]: T["subServices"][K];
    };
};

export class EntityBuilder<
    Methods extends Record<string, unknown>,
    Pipes extends readonly unknown[],
> {
    private methods: Methods;
    private pipes: Pipes;
    private constructor(v: Methods, pipes: Pipes) {
        this.pipes = pipes;
        this.methods = v;
    }

    before<Input extends ZodObject<ZodRawShape>, ReturnType, PipeInstance = Pipe<Input, ReturnType>>(v: PipeInstance): EntityBuilder<Methods, [...Pipes, PipeInstance]> {
        return new EntityBuilder(this.methods, [...this.pipes, v]);
    }

    addMethod<
        T extends ZodObject<ZodRawShape>,
        Response extends Record<string, unknown>,
        Return,
        Name extends string,
    >(
        name: Name,
        schema: T,
        handler: (v: z.infer<T> & z.infer<Last<Pipes>>) => Return,
    ): EntityBuilder<Methods & { [K in Name]: typeof handler }> {
        return new EntityBuilder({
            ...this.methods,
            [name]: handler,
        });
    }

    static new() {
        return new EntityBuilder({});
    }

    build(): Service<{
        methods: Methods;
        subServices: {};
    }> { }

    static fromClass<T>(cls: Class<T>): Service<{
        methods: Record<string, Function>;
        subServices: Record<string, unknown>;
    }> {
        const methodEntries: [string, Function][] = [];
        const subServiceEntries: [string, unknown][] = [];

        for (const key of Object.getOwnPropertyNames(cls)) {
            if (key === "length" || key === "name" || key === "prototype")
                continue;

            const value = (cls as any)[key];
            if (typeof value === "function") {
                methodEntries.push([key, value]);
            }
            else {
                subServiceEntries.push([key, value]);
            }
        }

        return {
            methods: Object.fromEntries(methodEntries),
            subServices: Object.fromEntries(subServiceEntries),
        };
    }

    static fromNormalObject<T extends URecord>(obj: T): Service<{
        methods: Record<string, Func>;
        subServices: Record<string, unknown>;
    }> {
        const methodEntries: [string, Function][] = [];
        const subServiceEntries: [string, unknown][] = [];

        let current = obj;
        while (current && current !== Object.prototype) {
            for (const key of Object.getOwnPropertyNames(current)) {
                if (key === "constructor")
                    continue;

                const descriptor = Object.getOwnPropertyDescriptor(current, key);
                if (!descriptor)
                    continue;

                if (typeof descriptor.value === "function") {
                    methodEntries.push([key, descriptor.value]);
                }
                else {
                    subServiceEntries.push([key, descriptor.value]);
                }
            }
            current = Object.getPrototypeOf(current);
        }

        return {
            methods: Object.fromEntries(methodEntries),
            subServices: Object.fromEntries(subServiceEntries),
        };
    }
}
