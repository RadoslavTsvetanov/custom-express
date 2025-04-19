import { CustomWebSocketRouter, HookBuilder, MessageThatCanBeReceivedBuilder } from "@custom-express/framework";
import { z } from "zod";
import { mutationsSchemas, schemas } from "../types/schemas";



export const newTrainData = new MessageThatCanBeReceivedBuilder(
  {
    afterHandler: {
      ordered: HookBuilder
        .new()
        .add({
          key: "ojjoi" as const,
          execute: (v) => ({ ko: "" }),
        })
        .build(),
      independent: [],
    } as const,
    beforeHandler: {
      ordered: HookBuilder.new()
        .add({
          key: "iooi" as const,
          execute: (v) => ({ lolo: "" } as const),
        } as const)
        .build(),
      independent: [],
    } as const,
    onErrorr: v => "",
  },
  (v) => {console.log("ko") }
).build()





export const defintion = new CustomWebSocketRouter({})
    .addChannel("train", {
        hooks: {
            beforeHandle: {
                ordered: HookBuilder
                    .new()
                    .add({
                        key: "lolo",
                        execute: (v) => ({ hi: "" } as const),
                    })
                    .build(),
                independent: [],
            },
        },
        messagesItCanReceive: {
            newTrainData: new MessageThatCanBeReceivedBuilder({
                beforeHandler: {
                    ordered: HookBuilder.new()
                        .add({
                            key: "ff",
                            execute: (v) => "" as const,
                        })
                        .build(),
                },
                afterHandler: {
                    ordered: HookBuilder.new().add({ key: "jiji", execute: v => 1 }).build(),
                    independent: []
                },
                onErrorr: b => console.log
            },
                v => { }
            ).build(),
        } as const,
        messagesItCanSend: {
            trainData: z.object({
                line: schemas.line,
                ...mutationsSchemas.liveEntityData,
            }),
        },
    });

export const router = new CustomWebSocketRouter({}).addChannel("channel-1", {
  hooks: {
    beforeHandle: {
      ordered: HookBuilder.new()
        .add({
          key: "lolo",
          execute: (v) => ({ hi: "" } as const),
        })
        .build(),
      independent: [],
    },
  },
  messagesItCanReceive: {
    puki: pukiMessage,
  } as const,
  messagesItCanSend: {
    puki: z.object({
      puki: z.string(),
    }),
  },
});

