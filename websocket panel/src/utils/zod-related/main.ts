import type {ZodObject, ZodSchema, ZodTypeAny} from "zod";
import {ZodUnion} from "zod";
import {Errorable} from "../../non-lib-specific-things/Errorable.ts";
import {Optionable} from "errors-as-types/lib/rust-like-pattern/option";
import type {ICustomError} from "errors-as-types/lib/rust-like-pattern/result";
import type { MyZodDefinitions } from "../../types/zod/zod.ts";


export function parseZodUnion(schema:ZodUnion<MyZodDefinitions.ObjectUnion>): Array<unknown> {
        // return schema.options.flatMap(parseZodUnion);


        return schema.options || []
}


export function parseZodParameterObject(parametersObject: ZodSchema){

}



