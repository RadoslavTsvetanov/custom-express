import { typeApiAccess } from 'aws-sdk/clients/finspacedata';
import type {ZodObject, ZodSchema} from "zod";
import {z} from "zod";
import {logWithoutMethods} from "../logging.ts";
import {Optionable} from "errors-as-types/lib/rust-like-pattern/option";
import { MyZodDefinitions } from "../../types/zod/zod.ts";
import { MyOpenApiDefinitions } from "../../types/openapi/main.ts";
import type { ParameterType } from 'aws-sdk/clients/cloudformation';

type Entity = MyOpenApiDefinitions.Entity

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


function extractZodSchemaChecksIntoDescription(checks: (MyZodDefinitions.DataCheck)[]){
    return checks.reduce((description, check) => description + JSON.stringify(check), "")
}

function populateOpenapiFieldsFromZodChecks(obj: MyZodDefinitions.ZodLike): Entity{

    let objToReturn: Entity = {
        type: (() => {
            const typeName = obj._def.typeName.slice(3).toLowerCase()
            return Object.values(MyOpenApiDefinitions.ParameterType).includes(typeName as MyOpenApiDefinitions.ParameterType) ?  typeName as MyOpenApiDefinitions.ParameterType : MyOpenApiDefinitions.ParameterType.unknown})(),
        description: new Optionable(obj._def.description).unpack_with_default("") + extractZodSchemaChecksIntoDescription(obj._def.checks),
        required: true,
        properties: {},
        checks: {}
    }

    obj._def.checks.forEach(check => objToReturn = {
        ...objToReturn,
        checks: { ...objToReturn.checks,[check.kind]: check.value }
    })

    return objToReturn
}





export function zodSchemaIntoOpenapiResponseContentDefinition(responseDefinition: ZodObject<any>, schema: MyOpenApiDefinitions.Entity = {type: MyOpenApiDefinitions.ParameterType.object,properties: {}, checks: {}, description: "", required: true}): MyOpenApiDefinitions.Entity {
    Object.keys(responseDefinition.shape).forEach(key => {
        const shapeElement = responseDefinition.shape[key]

        if(shapeElement._def.typeName === MyZodDefinitions.Shapes.Optional){
            schema.properties[key] = populateOpenapiFieldsFromZodChecks(shapeElement
                ._def.innerType)
            schema.properties[key].required = false
        }

        if(shapeElement._def.checks) {
            schema.properties[key] = populateOpenapiFieldsFromZodChecks(shapeElement)
        }
        if(shapeElement._def.typeName === MyZodDefinitions.Shapes.Object){
            schema.properties[key] = {
                type: MyOpenApiDefinitions.ParameterType.object,
                checks : {},
                description: "",
                required: false,
                properties :{}
            }
            zodSchemaIntoOpenapiResponseContentDefinition(shapeElement, schema.properties[key])
        }else{
        }
    })
    return schema
}

const examplObject = z.object({
    h: z.object({
        e: z.string().min(4).describe("a string")
    })
})

logWithoutMethods(examplObject.shape)

console.log(zodSchemaIntoOpenapiResponseContentDefinition(examplObject))