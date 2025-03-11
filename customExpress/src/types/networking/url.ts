import { GetSet } from "../../utils/getSetClass.ts";
import type { ApiPath } from "../apiApth.ts";
import {ContextSafeType} from "../baseContextSafeTypet.ts";


function hasExtension(s: string): boolean {
        return (s.indexOf("ws://") > -1 || s.indexOf("http://") > -1 || s.indexOf("https://") > -1)
}

function HasTrailingSlash(s: string): boolean {
    return s[s.length - 1] === "/"
}


export class Url<T extends GetSet<string> = GetSet<string>>  extends ContextSafeType<T> {
    customValidator(h: T): boolean {
        const v = h.getV()
        return (hasExtension(v) && !HasTrailingSlash(v))

        
    }


    addPath(path: ApiPath) {
    
        return new Url(new GetSet(this.value.getV() + path.value))
    }

}