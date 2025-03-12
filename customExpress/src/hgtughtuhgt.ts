import {zodSchemaIntoOpenapiResponseContentDefinition} from "./utils/zod-related/parseZodSchema.ts";
import {literal, z} from "zod";
import {logWithoutMethods} from "./utils/logging.ts";

const g = zodSchemaIntoOpenapiResponseContentDefinition(z.object({
    h: z.union([z.literal(3), z.literal(1)])
}))

console.log("kook")
logWithoutMethods(g)
logWithoutMethods(z.object(({
    h: z.string()
})))