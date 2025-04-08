import type { UnknownRecord } from "../types/unknwonString"

export type Afterfix<T extends string, fix extends string> = `${T}${fix}`

export type AfterfixKeysOfRecord<
  T extends UnknownRecord,
  Fix extends string
> = {
  [K in keyof T as Afterfix<K & string, Fix>]: T[K]
}





type j = AfterfixKeysOfRecord<{koko: string}, "j">

// expected 

// type j = {
//     kokoj: string;
// }
