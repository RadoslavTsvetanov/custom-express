import { z } from "zod";
import { CustomWebSocketRouter } from "../../../src/builtins/websocket/server";


const schemas = {
    location:  
                z.object({
                    latitude: z.number().nonnegative(),
                    longitude: z.number().nonnegative()
                }),
    line: z.number().nonnegative()
}

const server = new CustomWebSocketRouter({
    train: {
        messagesItCanReceive: {
            newTrainData: z.object({
                location: schemas.location,
                line: z.number().nonnegative()   ,// liniq demek 102, 6, 280
                timestamp: z.date(),
            }),
        },
        messagesItCanSend: {
            trainData: {
                line: schemas.line,
                location: schemas.location,
            }
        }
    },
    passanger: {
        messagesItCanReceive: {

        newPassangerData: z.object({
            location: schemas.location,
        })
        },
        messagesItCanSend: {}
    }
})