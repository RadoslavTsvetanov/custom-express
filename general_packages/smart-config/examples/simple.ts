import { resolveFsAllow } from "vitest/node.js";
import { z, ZodObject, ZodRawShape } from "zod";
import { SmartConfig } from "../";


// Main Utility
;




const config = new SmartConfig(z.object({
   name: z.string(),
   isAdult: z.boolean(),
   isFF: z.boolean(),
   age: z.number()
})) 
config.new({
    enabled: ["isAdult", "isFF"],
})

config.incrementGroup(["age"])
const h = config.set("name", "jooj" as const).get("name")

config.enable("isAdult").raw()
config.increment("age")
config.decrement("age")
config.flip("isAdult")
config.enableGroup(["isAdult", "isFF"])

config.get("name")
config.set("name", "jojooj")





const cacheSchema = z.object({
  active: z.boolean().optional(),

  disable: z.array(z.string()).optional(),

  ttl: z.number().optional(),

  key: z.function().args(z.any()).returns(z.any()).optional(),

  tags: z.array(z.string()).optional(),

  group: z.string().optional(),

  resolver: z.function().args(z.any(), z.any()).returns(z.any()).optional(),

  shouldReturn: z.function().args(z.any()).returns(z.boolean()).optional(),

  bypassIf: z.function().args(z.any()).returns(z.boolean()).optional(),

  dependsOn: z.array(z.string()).optional(),

  errorFallback: z.boolean().optional(),

  autoRefreshInterval: z.number().optional(),

  plannedMiss: z.function().args(z.any()).returns(z.boolean()).optional(),

  metadataResolver: z.function().args(z.any(), z.any()).returns(z.any()).optional(),
})

type h = z.infer<typeof cacheSchema>["errorFallback"]
