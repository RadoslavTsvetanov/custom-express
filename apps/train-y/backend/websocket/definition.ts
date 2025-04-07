import { z } from "zod";
import { mutationsSchemas, schemas } from "../types/schemas";
import {CustomWebSocketRouter} from "@custom-express/framework"

export const defintion = new CustomWebSocketRouter({
    train: {
        hooks: {
            validate: z.object({
                shodior: z.number()
            }),
            validateResponse: z.object({
                pipipupu: z.number()
            })
        },
        messagesItCanReceive: {
            newTrainData: z.object({
                line: schemas.line   ,// liniq demek 102, 6, 280
                ...mutationsSchemas.liveEntityData
            }),
        },
        messagesItCanSend: {
            trainData: z.object({
                line: schemas.line,
                ...mutationsSchemas.liveEntityData
            })
        }
    },
    passanger: {
        hooks: {
            validate: z.object({
                egene: z.number(),
            }),
            validateResponse: z.object({
                ggg: z.number()
            })
        },
        messagesItCanReceive: {
        newPassangerData: z.object({
            ...mutationsSchemas.liveEntityData
        })
        },
        messagesItCanSend: {},
    }
})