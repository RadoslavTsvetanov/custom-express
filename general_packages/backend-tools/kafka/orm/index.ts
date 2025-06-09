import { z } from "zod";

const g = new KafkaConfig({
    data: {
        newData: {
            data: z.object({
                f: z.string(),
            }),
        },
    },
});
