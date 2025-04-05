import { ContextSafeType } from "../baseContextSafeTypet";


export class Port extends ContextSafeType<number>{
    customValidator(v: number): boolean {
        if (v < 0 || v > 65535) return false;
        return true
    }
}