import type { UnknownRecord } from "../types/unknwonString"

export type Afterfix<T extends string, fix extends string> = `${T}${fix}`

export type AfterfixKeysOfRecord<
  T extends UnknownRecord,
  Fix extends string
> = {
  [K in keyof T as Afterfix<K & string, Fix>]: T[K]
}




export type FirstArg<T extends (...args: any[]) => any> = T extends (arg1: infer A, ...args: any[]) => any ? A : never;

type j = AfterfixKeysOfRecord<{koko: string}, "j">

// expected 

// type j = {
//     kokoj: string;
// }


export type NeverWithDefault<T, Default> = T extends never ? Default : T