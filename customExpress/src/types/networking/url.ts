import type { GetSet } from "../../utils/getSetClass.ts";
import type { ApiPath } from "../apiApth.ts";
import {ContextSafeType} from "../baseContextSafeTypet.ts";

export class Url<T extends GetSet<string> = GetSet<string>>  extends ContextSafeType<T> {
    customValidator(h: T): boolean {
        const v = h.getV()
        if((v.indexOf("://") < 0) || (v.indexOf("ws") < 0 || v.indexOf("http") < 0) || v[v.length - 1] === "/"){
           return false
        }

        return true
    }


    addPath(path: ApiPath) {
        this.value.setV(this.value.getV() + "/" + path.value);
        return this;
    }

}