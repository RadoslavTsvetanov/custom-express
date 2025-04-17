// Type + runtime tests in one file
import { expect, test } from "bun:test";
import { expectType } from "tsd";
import { HookBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/HookBuilder";
import { MessageThatCanBeReceivedBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/MessageBuilder";
import { Handler } from "../../../../../../src/core/websocket/types/Message/main";

// ✅ Shared builder setup
const hooks = HookBuilder.new().add({
  key: "hi",
  execute: () => ({ hi: "" } as const),
}).build();

// ✅ Build the message
const msg = new MessageThatCanBeReceivedBuilder(
  {
    beforeHandler: {
      ordered: hooks,
      independent: [],
    },
    afterHandler: {
      ordered: hooks,
      independent: [],
    },
    onErrorr: () => "" as const,
  },
  (v) => {
    // ✅ TSD Type assertion
    expectType<{ readonly hi: "" }>(v);

    return {
      ...v,
      koko: "",
    };
  }
);


expectType<
    {
    key: "hi";
    execute: Handler<{}, {
        readonly hi: "";
    }>;
}
    >(msg._hooks.beforeHandler.ordered.elements.value[0])


// ✅ Runtime check (Bun test)
test("msg should be an object", () => {
  expect(typeof msg).toBe("object");
});
