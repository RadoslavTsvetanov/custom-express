import { describe, expect, it } from "bun:test";
import { z, ZodObject, ZodRawShape } from "zod";
import { HookBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/HookBuilder";
import { MessageThatCanBeReceivedBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/MessageBuilder";
import { ChannelBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/ChannekBuilder";



  const initialHooks = HookBuilder.new()
    .add({ key: "kokiiiio", execute: v => "" })
    .add({ key: "p", execute: v => { } })
    .build();

  const initialSenders = {
    jiji: z.object({ hi: z.string() }),
    lplp: z.object({ h9i: z.object({ koko: z.string() }) }),
  };

  const initialReceivers = {
    kokoko: MessageThatCanBeReceivedBuilder.new(
      HookBuilder
        .new()
        .add({ key: "koijko", execute: v => "" })
        .build(),
      z.object({ jo: z.string() }),
      v => { }
    ).build(),
  } as const;

  const baseChannel = new ChannelBuilder(
    initialHooks,
    initialSenders,
    initialReceivers
  );

  const fullChannel = baseChannel
    .addReceiver({
      name: "h" as const,
      config: {
        hooks: HookBuilder.new()
          .add({ key: "jido", execute: v => 3 })
          .add({ key: "jiido", execute: v => ({ jibri: "", chili: "" } as const) })
          .add({ key: "keko", execute: v => { } })
          .build(),
        handler: v => { },
      },
      parse: z.object({ s: z.string() }),
    } as const)
    .addReceiver({
      name: "jiko",
      config: {
        hooks: HookBuilder.new().add({ key: "lolo", execute: v => { } }).build(),
        handler: v => "",
      },
      parse: z.object({ hi: z.string() }),
    })
    .addSender({
      name: "kook",
      schema: z.object({}),
    });



// -----------------------
// Runtime Tests
// -----------------------

describe("ChannelBuilder", () => {

  it("should have correct message senders", () => {
    expect(Object.keys(fullChannel._messagesItCanSend)).toEqual(["jiji", "lplp", "kook"]);
  });

  it("should have correct message receivers", () => {
    expect(Object.keys(fullChannel._messagesItCanReceive)).toEqual(["kokoko", "h", "jiko"]);
  });

  it("should build hook builder from channel", () => {
    const hookBuilder = fullChannel.createHookBuilder();
    expect(typeof hookBuilder.add).toBe("function");
  });
});


// -----------------------
// Type Tests
// -----------------------

type Assert<T extends true> = T;
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

type Channel = ReturnType<
  typeof ChannelBuilder["prototype"]["addReceiver"]
    // this is a simulation, normally chained with addSender/addReceiver
>;

// Type test: verify send message keys
type SenderKeys = keyof typeof fullChannel._messagesItCanSend;
type _1 = Assert<Equals<SenderKeys, "jiji" | "lplp" | "kook">>;

// Type test: verify receiver message keys
type ReceiverKeys = keyof typeof fullChannel._messagesItCanReceive;
type _2 = Assert<Equals<ReceiverKeys, "kokoko" | "h" | "jiko">>;

// Type test: check schema type for `jiji`
type JijiSchema = typeof fullChannel._messagesItCanSend.jiji;
type _3 = Assert<Equals<JijiSchema, ZodObject<{ hi: z.ZodString }>>>;

// Type test: check receiver schema for `kokoko`
type KokokoReceiver = typeof fullChannel._messagesItCanReceive.kokoko;
type _4 = Assert<"parse" extends keyof KokokoReceiver ? true : false>;

