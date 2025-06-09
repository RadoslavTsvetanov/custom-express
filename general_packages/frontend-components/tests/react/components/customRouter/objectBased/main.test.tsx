import React from "react";
import { describe, it, expect } from "vitest";
import { newRoute, Pages } from "../../../../../src/react/components/customRouter/objectBased/main";

const routes = [
  newRoute({
    url: { userId: "1" },
    handler: ({ userId }) => <div>User {userId}</div>,
  }),
  newRoute({
    url: { userId: "2" },
    handler: ({ userId }) => <div>User {userId}</div>,
  }),
  newRoute({
    url: { userId: "3", admin: "true" },
    handler: ({ userId }) => <div>Admin {userId}</div>,
  }),
] as const;

describe("Pages", () => {
  it("returns exact matching JSX", () => {
    const element = <Pages pages={routes} currentUrl={{ userId: "2" }} />;
    const expected = (
      <div>
        <div>User 2</div>
      </div>
    );
    expect(element).toEqual(expected);
  });

  it("returns closest matching JSX", () => {
    const element = <Pages pages={routes} currentUrl={{ userId: "3" }} />;
    const expected = (
      <div>
        <div>Admin 3</div>
      </div>
    );
    expect(element).toEqual(expected);
  });

  it("returns fallback JSX when no match", () => {
    const element = <Pages pages={routes} currentUrl={{ nope: "yeah" }} />;
    const expected = (
      <div>
        <div>User 1</div>
      </div>
    );
    expect(element).toEqual(expected);
  });

  it("returns empty div when no routes", () => {
    const element = <Pages pages={[]} currentUrl={{}} />;
    const expected = <div></div>;
    expect(element).toEqual(expected);
  });
});
