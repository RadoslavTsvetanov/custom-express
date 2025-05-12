import type { URecord } from "@custom-express/better-standard-library"
import { newRoute, Pages } from "./main"

const PageRoutable3 = () => {
    <Pages
        currentUrl={{ji: ""}} // type safe even here you can not assign something that is not in the union compromised of the individual schemas
        pages={
            [
                newRoute({
                    url: { ji: "" },
                    handler: v => <div>hi {v.ji}</div>  
                }) ,
                newRoute({                
                    url: { ko: "" },
                    handler: v => <div>kur {v.ko}</div>
                })
            ] as const 
        }
    />
}