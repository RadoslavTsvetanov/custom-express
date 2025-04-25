import { Optionable } from "../errors-as-values/src/rust-like-pattern/option";

export type OptionalPromise<T> = Promise<Optionable<T>>
export type OPromise<T> = OptionalPromise<T>