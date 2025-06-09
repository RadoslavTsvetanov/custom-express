import {describe, expect, expectTypeOf, test} from "vitest"
import React from "react";
import { NavigationBar , ExtractParam } from "../../../../../src/react/components/customRouter/urlBased/main";
import { expectType, expectError } from 'tsd';
import { unknown } from "zod";

const Dummy = ({ params }: { params: any }) => <div>{params.id}</div>;

describe("NavigationBar", () => {
  test("returns 404 when no match", () => {
    const result = NavigationBar({
      currentUrl: "/no-match",
      routes: [{ path: "/user/:id", component: Dummy }],
    });

    expect(result).toEqual(<div>404: Not Found</div>);
  });

  test("returns component with matched params", () => {
    const result = NavigationBar({
      currentUrl: "/user/42",
      routes: [{ path: "/user/:id", component: Dummy }],
    });

    expect(result).toEqual(
      <nav>
        <Dummy params={{ id: "42" }} />
      </nav>
    );
  });
});

describe('ExtractParam', () => {
  test('extracts nothing for static path', () => {
    expectTypeOf<ExtractParam<'/home'>>().toEqualTypeOf<{}>();
  });

  test('extracts one dynamic param', () => {
    expectTypeOf<ExtractParam<'/:id'>>().branded.toEqualTypeOf<{ id: string }>();
  });

  test('extracts param from static + dynamic path', () => {
    expectTypeOf<ExtractParam<'/post/:slug'>>().branded.toEqualTypeOf<{ slug: string }>();
  });

  test('extracts multiple dynamic params', () => {
    expectTypeOf<ExtractParam<'/user/:userId/post/:postId'>>().branded.toEqualTypeOf<{
      userId: string;
      postId: string;
    }>();
  });

  test('handles trailing slash', () => {
    expectTypeOf<ExtractParam<'/hello/:name/'>>().branded.toEqualTypeOf<{ name: string }>();
  });

  test('handles mixed static/dynamic segments', () => {
    expectTypeOf<ExtractParam<'/x/:a/y/:b/z'>>().branded.toEqualTypeOf<{
      a: string;
      b: string;
    }>();
  });

  test('extracts only the first param when second part is static', () => {
    expectTypeOf<ExtractParam<'/:bad/segment'>>().branded.toEqualTypeOf<{ bad: string }>();
  });

  test('empty string path returns never', () => {
    expectTypeOf<ExtractParam<''>>().toEqualTypeOf<never>();
  });
});

