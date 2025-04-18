import { z } from "zod";
import { mutationsSchemas, schemas } from "../types/schemas";
import { WebsocketRouter, HookOrderedRecord } from "@custom-express/framework";
import { OrderedRecord } from "@custom-express/better-standard-library";

export const defintion = new WebsocketRouter({
    train: {
        messagesItCanReceive: {
            newTrainData: {
                config: {
                    hooks: {
                        beforeHandler: {
                            ordered: new HookOrderedRecord([
                                {
                                    key: "example-key",
                                    execute: (context) => {
                                        // optionally type ctx here
                                        return "";
                                    },
                                },
                                {
                                    key: "koko",
                                    execute: (context) => {
                                        return {
                                            l: "l"
                                        }
                                    }
                                }
                            ]),
                        },
                    },
                    handler: (context) => {
                        // do something with ctx
                        return {}
                    },
                },
                parse: z.object({
                    line: schemas.line,
                    ...mutationsSchemas.liveEntityData,
                }),
            },
        },
        messagesItCanSend: {
            trainData: z.object({
                line: schemas.line,
                ...mutationsSchemas.liveEntityData,
            }),
        },
    },
});


