import React from "react";
import type { URecord } from "@custom-express/better-standard-library";
import type { JsxElement } from "typescript";
// ✅ 1. Strong Type Safety

// Each route is tied to a specific shape (url object), so your handlers automatically get typed input. TypeScript knows exactly what keys and values the handler receives based on the url object. For example:

// {
//   url: { userId: string },
//   handler: ({ userId }) => () => <div>User {userId}</div>
// }

// If you forget userId, or mistype it, the compiler will scream at you. 🎉
// ✅ 2. Descriptive and Declarative

// Instead of writing regex-based or string-based routes, you're defining them as structured objects:

// { url: { postId: '123', commentId: '456' } }

// This removes ambiguity and makes routes self-documenting.
// ✅ 3. Composable and Extensible

// You can build middlewares, guards, or transformations based on the url object directly. For example:

// const secureRoute = <T extends objectBasedRoute<any>>(route: T) => ({
//   ...route,
//   handler: (v: T['url']) => () => {
//     if (!isAuthenticated()) return <LoginPage />;
//     return route.handler(v);
//   }
// });

// ✅ 4. Validation and Routing Logic Decoupling

// Since url is a plain object, it's trivial to:

//     Validate inputs (e.g. with Zod or Yup)

//     Serialize/deserialize to/from query strings or paths

//     Generate routes programmatically

// ✅ 5. Better Dev Tooling and Intellisense

// Want to list all routes? Iterate the array. Need all parameters? Hover over url. Need to know what the handler expects? It’s right there with proper type inference.
// ✅ 6. Frontend-Backend Contract Matching

// When building full-stack apps (e.g. with tRPC or RPC-like APIs), this design pattern ensures your frontend and backend are aligned on route shapes, turning url into a shared schema.

type objectBasedRoute<T extends URecord> = {
  url: T,
  handler: (v: T) => React.ReactNode
};

// Generic factory to preserve type
export function newRoute<T extends URecord>(v: objectBasedRoute<T>): objectBasedRoute<T> {
  return v;
}

function defineRoutes<T extends readonly objectBasedRoute<URecord>[]>(...routes: T): T {
  return routes;
}


type ExtractKey<T, K> = K extends keyof T ? T[K] : never;

const compareObjects = (a: URecord, b: URecord): number => {
  let score = 0;

  // Compare properties of a and b
  for (let key in a) {
    if (a[key] === b[key]) {
      score += 1; // Increase score for a match
    }
  }

  return score;
};

export function findClosest<T extends URecord[]>(range: T, provided: T[number]): number {
  let closestIndex = -1;
  let bestScore = -1;

  for (let i = 0; i < range.length; i++) {
    const candidate = range[i];
    const score = compareObjects(provided, candidate);

    if (score > bestScore) {
      closestIndex = i;
      bestScore = score;
    }
  }

  return closestIndex;
}


export const Pages = <T extends readonly URecord[]>(
    { pages, currentUrl }: {
        pages: { [K in keyof T]: objectBasedRoute<
            T[K]> }; currentUrl: T[number]
    }
) => {
const CurrentPage = pages[findClosest(pages.map(page => page.url), currentUrl)]["handler"] 
  return (
    <div>
        <CurrentPage />
    </div>
  );
};
