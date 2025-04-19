import { z } from "zod";
import { pukiMessage } from "./Message";
import { HookBuilder } from "../../src/core/websocket/server/utilites/builders/HookBuilder";
import { CustomWebSocketRouter } from "../../src/core/websocket/server/app";

export const router = new CustomWebSocketRouter({}).addChannel("channel-1", {
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
    puki: pukiMessage,
  } as const,
  messagesItCanSend: {
    puki: z.object({
      puki: z.string(),
    }),
  },
});
