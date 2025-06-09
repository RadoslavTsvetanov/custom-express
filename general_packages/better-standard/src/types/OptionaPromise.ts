import type { Optionable } from "../errors-as-values/rust-like-pattern/option";

export type OptionalPromise<T> = Promise<Optionable<T>>;
export type OPromise<T> = OptionalPromise<T>;
