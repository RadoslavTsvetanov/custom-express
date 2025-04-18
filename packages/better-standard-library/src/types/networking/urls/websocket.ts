import { ContextSafeType } from "../../../errors-as-values/baseContextSafeTypet";
import type { Port } from "../port";

export class WebsocketUrl extends ContextSafeType<string>{
    customValidator(v: string): boolean {
        if (v.indexOf("ws://") < 0) {
           return false 
        }
        return true
    }

    static unsafe =
         {
            withLocalhost: (port: Port) => {
                return new WebsocketUrl(`ws://localhost:${port.value}`)
            }
        }
            
    

}