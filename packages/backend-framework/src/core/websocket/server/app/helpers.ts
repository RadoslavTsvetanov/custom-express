import { TrueMap } from "@custom-express/better-standard-library";
import { Hook } from "../../types/Hooks/main";

export function runOrderedHooks<T>(
  ordered: { handler: (arg: T) => T }[],
  initial: T
): T {
  if (!ordered.length) return initial;

  return ordered.slice(1).reduce(
    (acc, fn) => fn.handler(acc),
    ordered[0].handler(initial)
  );
}

export function runHookHandler<HookToBeRun extends Hook<unknown, unknown>>({ordered, independent}: HookToBeRun, arrivingContext: {}) {
    independent.forEach(handler => handler(arrivingContext))

    return TrueMap.new(runOrderedHooks(ordered, arrivingContext))
}


export function runMessageHandler({ handler, hooks, context }) {
  // Run beforeHandler
  runHookHandler(hooks.beforeHandler, context);

  // Run the main handler
  const result = handler(context);

  // Run afterHandler
  runHookHandler(hooks.afterHandler, { ...context, result });

  return result;
}
