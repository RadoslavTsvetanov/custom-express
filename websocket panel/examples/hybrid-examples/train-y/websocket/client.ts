import { multer } from 'multer';
import { Port } from "../../../../src/types/networking/port";
import { WebsocketUrl } from "../../../../src/types/networking/urls/websocket";
import { defintion } from "./definition";
import { number } from 'zod';

const clientBuilder =  defintion.getCLientBuilder(WebsocketUrl.unsafe.withLocalhost(new Port(4000)))

const client = clientBuilder.generateClient()
const listener = clientBuilder.setupListeners<false>({
    train: {
        trainData: {
            handler: async v => {
                console.log(v)
            }
        }
    }
})
const g = clientBuilder.getReusableListener()
    .hook({
        name: "jiji", 
        type: "beforeMessage",
        handler: v => {
            return {
                h: 1
            }
        }
    })
    // .before({
    //     nameOfHookWhichWeWantToBeBefore: "jiji",
    //     name: "biji",
    //     handler: v => {

    //     },
    // })
    .hook({
        name: "koko",
        type: "beforeMessage",
        handler: v => {
            return {
                lolo: "lolo"
            } as const // so that if it is a literal it will keep the literal type info in general place as consts whenever you can  
        }
    })

    const h = g.hook({
        name: "buhi",
        type: "beforeMessage",
        handler: v => {
            const hg = g.hooks.elements.value[0]
            typeof hg
            // ^? 

            v.lolo // since this is the return type of jiji
           // ^?   
            return {}
        }
    })
    