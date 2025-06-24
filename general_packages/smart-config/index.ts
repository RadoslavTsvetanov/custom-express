import { resolveFsAllow } from "vitest/node.js";
import { z, ZodObject, ZodRawShape } from "zod";

type InferType<T extends z.ZodTypeAny> = z.infer<T>;

// Main Utility
type getOnlyBooleans<T extends z.ZodObject<any>> = {
  [K in keyof z.infer<T> as z.infer<T>[K] extends boolean ? K : never]: z.infer<T>[K];
};


const schema = z.object({
    name: z.string(),
    isA: z.boolean()
  });
  
  type j = getOnlyBooleans<typeof schema>;

type getOnlyNumbers<T extends z.ZodObject<any>> = {
    [K in keyof z.infer<T> as z.infer<T>[K] extends number ? K : never]: z.infer<T>[K];
};

type getOnlyStrings<T extends z.ZodObject<any>> = {
    [K in keyof z.infer<T> as z.infer<T>[K] extends string ? K : never]: z.infer<T>[K];
};


class smartConfig<T extends ZodObject<ZodRawShape>, Values extends {[K in keyof z.infer<T>]: unknown}> {
    private values: Values = {} as any;
    constructor(private schema: T, private values: Values = {} as any)    {}

    set<Key extends keyof z.infer<T>, H extends z.infer<T>[Key]>(key: Key, value: H): smartConfig<T, Values & { [K in Key]: H }>{
        this.values[key] = value
        return new smartConfig<T, Values & { [K in Key]: H }>(this.schema, this.values)
    }
    
    
    enable<Key extends keyof getOnlyBooleans<T>>(key: Key){
        this.values[key] = true
        return new smartConfig<T, Values & { [K in Key]: true }>(this.schema, this.values)
    }
    disable<Key extends keyof getOnlyBooleans<T>>(key: Key){
        this.values[key] = false
        return new smartConfig<T, Values & { [K in Key]: false }>(this.schema, this.values)
    }
    flip<Key extends keyof getOnlyBooleans<T>>(key: Key){
        this.values[key] = !this.values[key]
        return this.values[key] 
        ?  new smartConfig<T, Values & { [K in Key]: true }>(this.schema, this.values)
        :  new smartConfig<T, Values & { [K in Key]: false }>(this.schema, this.values)
    }

    increment<Key extends keyof getOnlyNumbers<T>>(key: Key){   
        this.values[key] = this.values[key] + 1
        return new smartConfig<T, Values & { [K in Key]: typeof this.values[key] }>(this.schema, this.values)
    }
    decrement<Key extends keyof getOnlyNumbers<T>>(key: Key){
        this.values[key] = this.values[key] - 1
        return new smartConfig(this.schema, this.values)
    }


    get<Key extends keyof Values>(key: Key): Values[Key] {
        return this.values[key] as const
    }       
    
    raw(): readonly Values{
        return this.values as const
    }
}


const config = new smartConfig(z.object({
   name: z.string(),
   isAdult: z.boolean(),
   age: z.number()
})) 

const h = config.set("name", "jooj" as const).get("name")
config.enable("isAdult").raw()
config.increment("age")
config.decrement("age")
config.flip("isAdult")


config.get("name")
config.set("name", "jojooj")

export default smartConfig
