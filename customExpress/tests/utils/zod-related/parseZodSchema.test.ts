import {expect, test} from "bun:test";
import {z} from "zod";
import {zodSchemaIntoOpenapiResponseContentDefinition} from "../../../src/utils/zod-related/parseZodSchema.ts";
import {parseZodUnion} from "../../../src/utils/zod-related/main.ts";
import {logWithoutMethods} from "../../../src/utils/logging.ts";



test("zodSchemaIntoOpenapiResponseContentDefinition basic", () => {
    const expected ={
        h: {
            e: {
                type: "string",
                description: "a string{\"kind\":\"min\",\"value\":4}",
                min: 4,
                required: true
            },
        },
    }

    const examplObject = z.object({
        h: z.object({
            e: z.string().min(4).describe("a string")
        })
    })

   expect(expected).toMatchObject(zodSchemaIntoOpenapiResponseContentDefinition(examplObject))

}) // this checks if the general logic is there since there are some edge cases but here we are checking if your general logic is right



test("zodSchemaIntoOpenapiResponseContentDefinition testing if it is working correctly in the presence of an optional", () => {
    const exampleObject = z.object({
        h: z.object({
            e: z.string().min(4).describe("a string").optional(),
            g: z.string().min(4).describe("a string")
        })
    })

    const expected = {
        properties: {
            h: {
                type: "object",
                    properties: {
                    e: {
                        type: "string",
                        description: "a string{\"kind\":\"min\",\"value\":4}",
                        checks: {

                            min: 4,
                        },
                        required: false
                    },
                    g:  {
                        type: "string",
                        description: "a string{\"kind\":\"min\",\"value\":4}",
                        checks: {min: 4},
                        required: true
                    }
                }
            }
        }
    }

    // logWithoutMethods()
    logWithoutMethods(exampleObject.shape)
    logWithoutMethods(exampleObject.shape.h.shape)

    const result = zodSchemaIntoOpenapiResponseContentDefinition(exampleObject)
    console.log("3")

    expect(result).toMatchObject(expected)
})