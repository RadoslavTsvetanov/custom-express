import { expect, test } from "bun:test";

import { EnvManager } from "../../src/safe-envs/env";

const e = new EnvManager([
    {
        key: "HUHU",
        default: "gg",
    },
    {
        key: "URL",
        default: "gg",
    },
    {
        key: "ooo",
        default: "oooo",
    },
]);

test("should load defult value ", () => {
    expect(e.get("HUHU")).toBe("gg");
});

test("should get envs with correct values", () => {
    expect(e.get("HUHU")).toBe("kikiki");
    expect(e.get("URL")).toBe("lolololo");
});
