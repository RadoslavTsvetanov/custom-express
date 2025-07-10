import { First } from "@blazyts/better-standard-library/src/type-level-functions/tuple/getFirst";
import { unknown } from "zod/v4";

class MicroserviesManager {
    constructor() {}


    addService(service) {
        // Logic to add a service
        console.log(`Service ${service.name} added.`);
    }
}

class Piper<Pipes extends readonly ({name: string, handler: (v: unknown) => unknown})[]> {
    private constructor(private pipes: Pipes) {
    }

    add(name: string, handler: (v: unknown) => unknown) {
        const newPipes = [...this.pipes, { name, handler }];
        return new Piper(newPipes);
    }

    pipe(v: unknown) {
        for (const pipe of this.pipes) {
            v = pipe.handler(v);
        }
        return v;
    }

    getRunner(): First<Pipes> {
        return (v: First<Pipes>);
    }

    static new<Pipes extends readonly ({name: string, handler: (v: unknown) => unknown})[]>(pipes: Pipes) {
        return new Piper(pipes);
    }
}

function hookify<T extends Record<string, unknown>>(v: T): { 
[K in keyof T]: T[K]
} & {
    hooks: {
        [K in keyof T as `on${Capitalize<string & K>}`]: 
    }
} {
    return v
}