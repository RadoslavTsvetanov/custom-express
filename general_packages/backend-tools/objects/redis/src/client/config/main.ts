import { SmartConfig } from "@blazyts/smart-config";
import { z } from "zod";

export const redisConfig = new SmartConfig(z.object({
    host: z.string().default("localhost"),
    port: z.number().default(6379),
    password: z.string().optional(),
    persistent: z.boolean().optional(),
    noCreate: z.boolean().optional(),
}))


redisConfig.get("host")