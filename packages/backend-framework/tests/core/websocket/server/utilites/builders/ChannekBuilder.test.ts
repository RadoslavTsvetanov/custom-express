import { expect, test } from "bun:test";
import { z } from "zod";
import { HookBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/HookBuilder";
import { CustomWebSocketRouter } from "../../../../../../src/core/websocket/server/app";
import { MessageThatCanBeReceivedBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/MessageBuilder";
import { expectType } from "tsd";




const pukiMessage = new MessageThatCanBeReceivedBuilder(
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
    onErrorr: (v) => "",
  },
  (v) => { }
).build()

// build does not work 


pukiMessage.config.hooks.beforeHandler.ordered.elements.value[0]


// RUNTIME TEST SETUP
const router = new CustomWebSocketRouter({})
  .addChannel("channel-1", {
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
      // puki: {
      //   pukiMessage
      // },
      puki: pukiMessage
    } as const,
    messagesItCanSend: {
      puki: z.object({
        puki: z.string(),
      }),
    },
  });


const channel1 = router.channels["channel-1"]


// --- TYPE-LEVEL TESTS (COMPILE-TIME ONLY) ---

type Channel1 = typeof router["channels"]["channel-1"];


test("message can be sent", () => {
  const schema = router.channels["channel-1"].messagesItCanSend["puki"];
  const parsed = schema.parse({ puki: "hello" });
  expect(parsed.puki).toBe("hello");
});

expectType<"lolo">(
  channel1["hooks"]["beforeHandle"]["ordered"]["elements"]["value"][0]["key"]
);

expectType<{ puki?: string }>(
  {} as z.infer<Channel1["messagesItCanSend"]["puki"]>
);

expectType<"iooi">(
  channel1.messagesItCanReceive.puki.config.hooks.beforeHandler.ordered.elements.value[0].key
);

// Uncomment to see a failing type test:
// type _TestFail = Assert<IsExact<"wrong", Channel1["hooks"]["beforeHandle"]["ordered"]["elements"]["value"][0]["key"]>>;
