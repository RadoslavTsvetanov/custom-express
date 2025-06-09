import type { VCallback } from "../../../../types/voidcallback";

export type IPipeable<V> = {
    pipe: (handler: VCallback<V>) => void;
};
