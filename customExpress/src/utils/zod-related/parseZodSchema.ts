import type {ZodObject, ZodSchema} from "zod";
import {z} from "zod";
import {logWithoutMethods} from "../logging.ts";
import {MyZod} from "../../types/zod/zod.ts"
import {Optionable} from "errors-as-types/lib/rust-like-pattern/option";
import ZodLike = MyZod.ZodLike;
// credits to https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e for this

// z.object({
//     // valid if string or:
//     optional: z.string().optional(), // field not provided, or explicitly `undefined`
//     nullable: z.string().nullable(), // field explicitly `null`
//     nullish: z.string().nullish(), // field not provided, explicitly `null`, or explicitly `undefined`
// });

// type
// {
    // optional?: string | undefined;
    // nullable: string | null;
    // nullish?: string | null | undefined;
// }


function extractZodSchemaChecksIntoDescription(checks: (MyZod.DataCheck)[]){
    return checks.reduce((description, check) => description + JSON.stringify(check), "")
}

function populateOpenapiFieldsFromZodChecks(obj: ZodLike): {description: string, [x: string]: any}{

    let objToReturn = {
        type: obj._def.typeName.slice(3).toLowerCase(),
        description: new Optionable(obj._def.description).unpack_with_default("") + extractZodSchemaChecksIntoDescription(obj._def.checks),
        required: true
    }

    obj._def.checks.forEach(check => objToReturn = {
        ...objToReturn,
        [check.kind]: check.value
    })

    return objToReturn
}

export function zodSchemaIntoOpenapiResponseContentDefinition(responseDefinition: ZodObject<any>, openapiResponseObject: Record<string, {}> = {}): object{
    Object.keys(responseDefinition.shape).forEach(key => {
        const shapeElement = responseDefinition.shape[key]

        if(shapeElement._def.typeName === MyZod.Shapes.Optional){
            openapiResponseObject[key] = populateOpenapiFieldsFromZodChecks(shapeElement
                ._def.innerType)
            openapiResponseObject[key] = {
                ...openapiResponseObject[key],
                required: false
            }
        }

        if(shapeElement._def.checks) {
            openapiResponseObject[key] = populateOpenapiFieldsFromZodChecks(shapeElement)
        }
        if(shapeElement._def.typeName === MyZod.Shapes.Object){
            openapiResponseObject[key] = {}
            zodSchemaIntoOpenapiResponseContentDefinition(shapeElement, openapiResponseObject[key])
        }else{
        }
    })
    return openapiResponseObject
}

const examplObject = z.object({
    h: z.object({
        e: z.string().min(4).describe("a string")
    })
})

logWithoutMethods(examplObject.shape)

console.log(zodSchemaIntoOpenapiResponseContentDefinition(examplObject))