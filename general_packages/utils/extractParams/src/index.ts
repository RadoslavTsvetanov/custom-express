export type ExtractParams<
  T extends string,
  ReturnType extends Record<string, string> = {}
> = T extends `/${infer CurrentParam}`
  ? CurrentParam extends `:${infer ParamName}`
    ? ParamName extends `${infer Param}/${infer Rest}`
      ? ExtractParams<`/${Rest}`, { [P in Param]: string } & { [P in keyof ReturnType]: ReturnType[P]}>
      : {[p in keyof ReturnType]: string} & {[p in ParamName]: string} 
    : CurrentParam extends `${infer NotDynamicParam}/${infer Rest}`
      ? ExtractParams<`/${Rest}`, ReturnType>
      : ReturnType
  : never 


type j = ExtractParams<"/koko/lolo/userId/:product/:koko/lolo/:lolo/popo/:kiki">;

export function extractParams<T extends string>(path: T): ExtractParams<T> {
    return {} as ExtractParams<T>;
}