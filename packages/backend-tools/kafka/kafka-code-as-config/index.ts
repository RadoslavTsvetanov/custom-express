import { z, type ZodObject, type ZodRawShape } from "zod"



const g = new KafkaConfig({
    data: {
        newData: {
            data: z.object({
                f: z.string()
            })
        }
    }
})
