import { z } from "zod";
import { CustomWebSocketRouter } from "../../../../src/builtins/websocket/server";
import { mutationsSchemas, schemas } from "../types/schemas";



export const defintion = new CustomWebSocketRouter({
    train: {
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
        messagesItCanReceive: {

        newPassangerData: z.object({
            ...mutationsSchemas.liveEntityData
        })
        },
        messagesItCanSend: {}
    }
})