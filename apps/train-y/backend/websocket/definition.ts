import { pukiMessage } from './../../../../packages/backend-framework/tests/dummmies/Message';
import { CustomWebSocketRouter, HookBuilder, MessageThatCanBeReceivedBuilder } from "@custom-express/framework";
import { z } from "zod";
import { mutationsSchemas, schemas } from "../types/schemas";
import { TrainService } from '../services/train/implementations/Prod';
import { Optionable } from '@custom-express/better-standard-library';

type id = number


const connections = new Map<id, WebSocket>()
const connections2 = new Map<WebSocket, number>()

const services = {
    train: new TrainService
}

export const defintion = new CustomWebSocketRouter({
    
}, {}, new Optionable({
    onConnection: {
        ordered: HookBuilder.new().add({
            execute: v => {
        connections.set(v,ws)
    }, key: ""}).build(), independent: []},
}))
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
                            execute: (v) => mutationsSchemas.liveEntityData.parse({}),
                        })
                        .build(),
                      independent:[]
                },
                afterHandler: {
                    ordered: HookBuilder.new().add({ key: "jiji", execute: v => 1 }).build(),
                    independent: []
                },
                onErrorr: b => console.log
            },
              v => { 
                // echo back to all connected clients
                  services.train.addData(connections2.get(ws).toString(), v)
                }
            ).build(),
        } as const,
        messagesItCanSend: {
            trainData: z.object({
                line: schemas.line,
            }),
        },
    });

