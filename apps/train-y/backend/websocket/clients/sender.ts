import { builder } from "./client-builder";

export const sender = builder.generateClient()




const nnn = builder.getReusableListener().hook({
    name: "jiji",
    type: "beforeMessage",
    handler: v => {
        return {
            ...v,
            huhu: {
                koko: {
                    lolo: ""
                }
            }
        }
    }
}).hook({
    name: "j",
    type: "afterMessage",
    handler: v => {
        return {}
    }
})