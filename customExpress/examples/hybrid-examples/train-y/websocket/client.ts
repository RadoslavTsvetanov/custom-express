import { multer } from 'multer';
import { Port } from "../../../../src/types/networking/port";
import { WebsocketUrl } from "../../../../src/types/networking/urls/websocket";
import { defintion } from "./definition";

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
clientBuilder.getReusableListener()
    .hook({
        name: "jiji", 
        type: "beforeMessage",
        handler: v => {
            return {
                h: ""
            }
        }
    })
    .before({
        nameOfHookWhichWeWantToBeBefore: "jiji",
        name: "biji",
        handler: v => {

        },
    })    .hook({
        name: "buhi",
        type: "beforeMessage",
        handler: v => {
            v.h // since this is the return type of jiji
            
            return {}
        }
    })
    .hook({
        name: "lolo",
        type: "beforeMessage",
        handler: () => {return {}}
    })