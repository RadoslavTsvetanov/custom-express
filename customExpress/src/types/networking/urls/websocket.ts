import { ContextSafeType } from "../../baseContextSafeTypet";

export class WebsocketUrl extends ContextSafeType<string>{
    customValidator(v: string): boolean {
        if (v.indexOf("ws://") < 0) {
           return false 
        }
        return true
    }
}