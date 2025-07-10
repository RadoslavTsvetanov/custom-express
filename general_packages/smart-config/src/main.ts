import { z, ZodObject, type ZodRawShape } from "zod";
import { types } from "./zod-utils/export";
import * as betterStandardLibrary from "@blazyts/better-standard-library";


let h:betterStandardLibrary.Overload.Types.OverloadsBase 


export class SmartConfig<T extends ZodObject<ZodRawShape>, Values extends {[K in keyof z.infer<T>]: unknown}> {
    constructor(private schema: T, private values: Values = {} as any)    {}

    set<Key extends keyof z.infer<T>, H extends z.infer<T>[Key]>(key: Key, value: H): SmartConfig<T, Values & { [K in Key]: H }>{
        this.values[key] = value
        return new SmartConfig<T, Values & { [K in Key]: H }>(this.schema, this.values)
    }
    setWhole(v: {
        enabled?: (keyof types.getOnlyBooleans<T>)[],
        disabled?: (keyof types.getOnlyBooleans<T>)[],
        values?: {[K in keyof z.infer<T>]: z.infer<T>[K]}
    }): Values {
        
    }

    new(v: {
        enabled?: (keyof types.getOnlyBooleans<T>)[],
        disabled?: (keyof types.getOnlyBooleans<T>)[],
        values?: {[K in keyof z.infer<T>]: z.infer<T>[K]}
    }): Values {
        
    }
    
    enable<Key extends keyof types.getOnlyBooleans<T>>(key: Key){
        this.values[key] = true
        return new SmartConfig<T, Values & { [K in Key]: true }>(this.schema, this.values)
    }

    enableGroup(keys: (keyof types.getOnlyBooleans<T>)[]) {
        
    }

    disable<Key extends keyof types.getOnlyBooleans<T>>(key: Key){
        this.values[key] = false
        return new SmartConfig<T, Values & { [K in Key]: false }>(this.schema, this.values)
    }

    flip<Key extends keyof types.getOnlyBooleans<T>>(key: Key) : SmartConfig<T, Values & { [K in Key]: Values[Key] extends true  ? true : false }>{
        this.values[key] = !this.values[key]
        return this.values[key] 
        ?  new smartConfig<T, Values & { [K in Key]: true }>(this.schema, this.values)
        :  new smartConfig<T, Values & { [K in Key]: false }>(this.schema, this.values)
    }

    increment<Key extends keyof types.getOnlyNumbers<T>>(key: Key){   
        this.values[key] = this.values[key] + 1
        return new SmartConfig<T, Values & { [K in Key]: typeof this.values[key] }>(this.schema, this.values)
    }
    decrement<Key extends keyof types.getOnlyNumbers<T>>(key: Key){
        this.values[key] = this.values[key] - 1
        return new SmartConfig(this.schema, this.values)
    }


    get<Key extends keyof Values>(key: Key): betterStandardLibrary.Base.Types.IBaseValue<Values[Key]> {
        return new betterStandardLibrary.Base.Main.BaseValue(this.values[key]) 
    }       
    
    raw(): readonly Values{
        return this.values 
    }

    incrementGroup(keys: (keyof types.getOnlyNumbers<T>)[]){
        keys.forEach(key => {
            this.values[key] = this.values[key] + 1
        })
        return new SmartConfig<T, Values & { [K in Key]: typeof this.values[key] }>(this.schema, this.values)
    }
}

