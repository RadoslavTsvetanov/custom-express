import type { Prefix } from "./src/metaprogramming/prefix";

type h = [{ hi: string }, { koko: string }];

export type FunctionArgsArray<T extends string> = {
  [K in T]: (arg: K) => void;
}[T][];

