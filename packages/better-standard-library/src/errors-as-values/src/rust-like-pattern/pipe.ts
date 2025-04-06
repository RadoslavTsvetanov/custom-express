import type { VCallback } from "../../../../types/voidcallback";

export interface IPipeable<V> {
    pipe: (handler: VCallback<V>) => void
}