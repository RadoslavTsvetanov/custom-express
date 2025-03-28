import { Port } from "../../../../src/types/networking/port";
import { WebsocketUrl } from "../../../../src/types/networking/urls/websocket";
import { defintion } from "./definition";

const clientBuilder =  defintion.getCLientBuilder(WebsocketUrl.unsafe.withLocalhost(new Port(4000)))

const client = clientBuilder.generateClient()
const listener = clientBuilder.setupListeners({
    train: {
        trainData: {
            handler: v => {
                console.log(v)
            }
        }
    }
})
