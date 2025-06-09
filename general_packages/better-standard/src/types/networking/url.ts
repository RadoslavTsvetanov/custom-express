import type { ApiPath } from "../apiApth.ts";

import { GetSet } from "../../../../packages/better-standard-library/data_structures/getSetClass.ts";
import { ContextSafeType } from "../baseContextSafeTypet.ts";

function hasExtension(s: string): boolean {
    return (
        s.includes("ws://")
        || s.includes("http://")
        || s.includes("https://")
    );
}

function HasTrailingSlash(s: string): boolean {
    return s[s.length - 1] === "/";
}

export class Url<
    T extends GetSet<string> = GetSet<string>,
> extends ContextSafeType<T> {
    customValidator(h: T): boolean {
        const v = h.getV();
        return hasExtension(v) && !HasTrailingSlash(v);
    }

    addPath(path: ApiPath) {
        return new Url(new GetSet(this.value.getV() + path.value));
    }
}
