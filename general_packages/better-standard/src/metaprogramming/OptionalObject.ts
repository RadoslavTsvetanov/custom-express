import type { Optionable } from "../errors-as-values/rust-like-pattern/option";

type Optional<T extends Record<string, unknown>> = {
    [Entry in keyof T]: Optionable<T[Entry]>
};

// exmaple usage

type hihi = Optional<{ hi: string; koko: number }>;

// Expected
// type hihi = {
//     hi: Optionable<string>;
//     koko: Optionable<number>;
// }
