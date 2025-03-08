import {ContextSafeType} from "../baseContextSafeTypet.ts";

export class Url extends ContextSafeType<string> {
    customValidator(v: string): boolean {
        if((v.indexOf("://") < 0) || (v.indexOf("ws") < 0 || v.indexOf("http") < 0)){
           return false
        }

        return true
    }

}