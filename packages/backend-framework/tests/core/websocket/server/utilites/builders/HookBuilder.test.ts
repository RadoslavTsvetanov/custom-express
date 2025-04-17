import { test, expect } from "bun:test";
import { expectType, expectAssignable } from "tsd";
import { HookBuilder } from "../../../../../../src/core/websocket/server/utilites/builders/HookBuilder";
import { Handler } from "../../../../../../src/core/websocket/types/Message/main";

function hihi(v: string) {
  return v.length == 3 ? "g" : "j";
}

// 🧪 TYPE TEST: Inference chain check
const hooks = new HookBuilder([{ key: "g", execute: async g => "" }] as const)
  .add({
    key: "koko",
    execute: (v) => {
      return {
        hi: "",
      } as const;
    },
  } as const)
  .add({
    key: "lolo",
    execute: (v) => {
      return {
        ...v,
        koki: hihi("so"),
      };
    },
  } as const)
  .add({
    key: "koki",
    execute: (v) => {},
  } as const)
  .build();

// 🧪 TYPE TEST: Second element
const secondHook = hooks.elements.value[1];
expectType<{
  key: "koko";
  execute: Handler<Promise<string>, { readonly hi: "" }>;
}>(secondHook);

// 🧪 TYPE TEST: Ensure `v.hi` is typed as `string`
const h = HookBuilder.new()
  .add({
    key: "koko",
    execute: (v) => {
      return { hi: "" } as const;
    },
  } as const)
  .add({
    key: "jiji",
    execute: (v) => {
      expectType<string>(v.hi);
      return {
        koko: {
          lolo: "",
        },
      } as const;
    },
  } as const)
  .build();

const firstElement = h.elements.value[0];
expectType<{
  key: "koko";
  execute: Handler<{}, { readonly hi: "" }>;
}>(firstElement);

// 🧪 RUNTIME TEST
test("HookBuilder builds a proper ordered record", () => {
  expect(h.elements.value.length).toBe(2);
  expect(hooks.elements.value[1].key).toBe("koko");
});
