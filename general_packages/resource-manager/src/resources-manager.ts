import { z, ZodSchema } from "zod"
import type { ZodAny, ZodBoolean, ZodObject } from "zod"

type Value = ({
    type: "object"
    value: Record<string, Value>
} | {
    type: "normal"
    value: ZodSchema
}) & {
    unique?: boolean
    optional?: boolean
}


const j: Value = {
    type: "normal",
    value: z.string()
}


// type customInfer<T extends Record<string, Value>> =  {
//     [K in keyof T]: T[K]["type"] extends "object" ? customInfer<T[K]["value"]> : z.infer<T[K]["value"]> 
// }

type customInfer<T extends Record<string, Value>> = {
    [K in keyof T]: T[K] extends { type: "object"; value: infer V }
    ? customInfer<V extends Record<string, Value> ? V : never>
    : T[K] extends { type: "normal"; value: infer S }
    ? z.infer<S extends ZodSchema ? S : never> // the extends is to make sure that the type is a zod schema although we know it is there to satisify the type system
    : never;
};


// function Entry<T extends Record<string, ZodSchema> | ZodSchema  >(v: T, unique?: boolean = false) : T extends {_def: infer F} ? {type: "normal" , value: T, unique: true} : {type: "object" , value: T, unique: true} {
//     return  (v._def !== null && v._def !== undefined) 
//     ? {type: "normal" , value: v, unique: true}
//     : {type: "object" , value: v, unique: true}
// }



function NormalEntry<T extends ZodSchema>(v: T, unique?: boolean = false): { type: "normal", value: T, unique: true } {
    return { type: "normal", value: v, unique: true }
}

function ObjectEntry<
    T extends Record<string, Value>,
    Unique extends boolean = false
>(v: T,unique?: Unique = false): isTrue<
    Unique,
    {type: "object",value: T,unique: true }, 
    {type: "object", value: T, unique: false}
>{
    return unique 
    ? {type: "object", value: v, unique}
    : {type: "object", value: v, unique}
}


class QlManager<Schema extends Record<string, unknown>> {
    schema: Schema
    constructor(v: Schema) {
        this.schema = v
    }

    add(v: customInfer<Schema>) {

    }

    get(query: Query<customInfer<Schema>>): z.infer<Schema>[] {
        return []
    }



    getUnique(query: Query<{ [K in keyof z.infer<Schema>]: z.infer<Schema>[K]["description"] extends "unique" ? z.infer<Schema>[K] : never }>): z.infer<Schema> {
        return
    }

    static new<T extends Record<string, unknown>>(v: T) {
        return new QlManager(v)
    }
}


const ql = QlManager.new({
    name: NormalEntry(z.string().describe("unique")),
    age: NormalEntry(z.number()),
    isStudent: NormalEntry(z.boolean()),
    address: ObjectEntry({
        street: NormalEntry(z.string()),
        city: NormalEntry(z.string()),
        zipCode: NormalEntry(z.string().optional()),
    })
})

function Unique<T extends ZodAny>(v: T): ZodObject<{ entry: T, unique: ZodBoolean }> {
    return z.object({ entry: v, unique: z.boolean() })
}



ql.add({
    name: "hoho",
    age: 12,
    isStudent: true,
    address: {
        street: "123 Main St",
        city: "Anytown",
        zipCode: "12345"
    }
})


class Dummy {
    constructor(public name: string, public age: number) { }
    hi() {
        console.log(`Hi, my name is ${this.name} and I am ${this.age} years old.`)
    }
}


const g = QlManager.new<{object: Dummy[]}>({})


