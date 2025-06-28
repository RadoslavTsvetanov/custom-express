import { z, ZodAny, ZodBoolean, ZodSchema, ZodUnknown, type ZodObject, type ZodRawShape } from "zod";
import { Optionable } from "@blazyts/better-standard-library";


type Value = ({
    type: "object"
    value: Record<string,Value>
} | {
    type: "normal"
    value: ZodSchema
}) & {
    unique?: boolean
    optional?: boolean
}


const j : Value = {
    type: "normal",
    value: z.string()
}


// type customInfer<T extends Record<string, Value>> =  {
//     [K in keyof T]: T[K]["type"] extends "object" ? customInfer<T[K]["value"]> : z.infer<T[K]["value"]> 
// }

type customInfer<T extends Record<string, Value>> = {
  [K in keyof T]: T[K] extends { type: "object"; value: infer V }
    ? customInfer<V & Record<string, Value>>
    : T[K] extends { type: "normal"; value: infer S }
      ? z.infer<S>
      : never;
};


// function Entry<T extends Record<string, ZodSchema> | ZodSchema  >(v: T, unique?: boolean = false) : T extends {_def: infer F} ? {type: "normal" , value: T, unique: true} : {type: "object" , value: T, unique: true} {
//     return  (v._def !== null && v._def !== undefined) 
//     ? {type: "normal" , value: v, unique: true}
//     : {type: "object" , value: v, unique: true}
// }

function NormalEntry<T extends ZodSchema>(v: T, unique?: boolean = false): {type: "normal" , value: T, unique: true} {
    return {type: "normal" , value: v, unique: true}
}

function ObjectEntry<T extends Record<string, Value>>(v: T, unique?: boolean = false): {type: "object" , value: T, unique: true} {
    return {type: "object" , value: v, unique: true}
}


const r = ObjectEntry({hi: NormalEntry(z.string())})

const l = NormalEntry(z.string())



const schema = {
    name: Entry(z.string().describe("unique")),
    age: z.number(),
    isStudent: z.boolean(),
    address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string().optional(),
    })
}





const h = null as customInfer<typeof schema>    



class QlManager<Schema extends Record<string, Value>>{
    schema: Schema
    constructor(v: Schema){
        this.schema = v
    }

    add(v: z.infer<Schema>){
        
    }

    get(query: Partial<z.infer<Schema>>): z.infer<Schema>[]{
        return []
    }

    getUnique(query: {[K in keyof z.infer<Schema>]: z.infer<Schema>[K]["description"] extends "unique" ? z.infer<Schema>[K] : never}): z.infer<Schema>{
        return
    }

    static new<T extends Record<string, Value>>(v: T){
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

function Unique<T extends ZodAny>(v: T): ZodObject<{entry:T, unique: ZodBoolean}>{
    return z.object({entry: v, unique: z.boolean()})
}

ql.add({
    name: "John",
    age: 30,
    isStudent: false,
    address: {
        street: "123 Main St",
        city: "Anytown",
        zipCode: "12345"
    }
})

ql.getUnique({})