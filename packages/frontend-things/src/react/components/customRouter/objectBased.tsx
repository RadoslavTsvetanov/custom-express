import React from "react";
import type { URecord } from "@custom-express/better-standard-library";
import type { JsxElement } from "typescript";
import { createRoute, NavigationBar, type ExtractParam, type RouteDefinition } from "./urlBased";

const UserPage: React.FC<{ params: { id: string } }> = ({ params }) => (
  <div>User ID: {params.id}</div>
);

const HomePage: React.FC<{ params: {} }> = () => (
  <div>Home Page</div>
);

const routes = [
  { path: '/user/:id', component: UserPage },
  { path: '/', component: HomePage },
] as const;

export const Route = <Url extends string>({
  path,
  handler,
}: {
  path: Url;
  handler: (v: ExtractParam<Url>) => React.ReactNode;
}): React.ReactElement => {
  // We'll just render this as a placeholder for the actual matching logic
  return <div>{handler({})}</div>;
};

createRoute({
    path: "/:koko",
    component: v => v.params.koko
})

export const App = () => (
    <NavigationBar currentUrl="/user/123" routes={
        [
            createRoute({
                path: "/:user/:poop",
                component: v => {return <div>{v.params.poop}</div>}
           }) 
        ]
  } />
);
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
function newRoute<T extends URecord>(v: objectBasedRoute<T>): objectBasedRoute<T> {
  return v;
}

// Helper to preserve the tuple type
function defineRoutes<T extends readonly objectBasedRoute<URecord>[]>(...routes: T): T {
  return routes;
}

const routes3 = defineRoutes(
  newRoute({
    url: { ji: "" },
    handler: v => <div>hi {v.ji}</div> 
  }),
  newRoute({
    url: { ko: "" },
    handler: v => <div>kur {v.ko}</div>
  }),
  newRoute({
    url: {
      userId: "",
    },
      handler: v => <div>{v.userId}</div>
  })
);

function handleRoutes<T extends readonly objectBasedRoute<URecord>[]>(r: T) {
  r.forEach(route => {
    console.log(Object.keys(route.url)); 
  });
}

handleRoutes(routes);
