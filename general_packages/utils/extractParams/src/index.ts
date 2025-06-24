import type { Optionable } from "@blazyts/better-standard-library";
import type { Alphabet, ContainsAtTheEnd, ContainsAtTheStart, RemoveNonAlphabetic } from "./utils";

type InferParamType<Param extends string> =
  ContainsAtTheEnd<Param, "$"> extends true
    ? number
    : ContainsAtTheEnd<Param, "("> extends true
      ? Date
      : ContainsAtTheEnd<Param, "^"> extends true
        ? boolean
        : string;





export type ExtractParams<
  T extends string,
  ReturnType extends Record<string, string> = {}
> = T extends `/${infer CurrentParam}`
  ? CurrentParam extends `:${infer ParamName}`
    ? ParamName extends `${infer Param}/${infer Rest}`
      ? ExtractParams<
        `/${Rest}`,
        {
          [P in Param as RemoveNonAlphabetic<P>]: ContainsAtTheStart<Param, "?"> extends true ? Optionable<InferParamType<Param>> :   InferParamType<Param>
        }
     &
        {
          [P in keyof ReturnType]: ReturnType[P]
        }
      >
    : { [P in keyof ReturnType]: ReturnType[P] } & { [p in ParamName]: string }
      : CurrentParam extends `${infer NotDynamicParam}/${infer Rest}`
        ? ExtractParams<`/${Rest}`, ReturnType>
        : ReturnType
  : never


export function extractParams<T extends string>(path: T): ExtractParams<T> {
  return {} as ExtractParams<T>;
}