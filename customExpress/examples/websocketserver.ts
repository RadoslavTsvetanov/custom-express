import { WebSocket } from "ws";
import { z } from "zod";
import { customWebsocket } from "../src/builtins/WebSocketServer";
import { Port } from "../src/types/networking/port";
import { ApiPath } from "../src/types/apiApth";
import { Url } from "../src/types/networking/url";
import { GetSet } from "../src/utils/getSetClass";

// Define WebSocket Port
const port = { value: 8080 };

// Create WebSocket Router
const wsRouter = new customWebsocket.CustomWebSocketRouter(new Port(5555), {
  hello: {
    messagesItCanReceive: {
      newData: {
        message: ""
      }
      
    },
    messagesItCanSend: {
      sendHelloTheOtherListeners: {
        message: ""
      }
    }
  }
})


// wsRouter.generateListeners(new Url(new GetSet("http://lovalhost:5000")), {
//   "hello": d => {
//     console.log(d);
//   }
// })

console.log(await wsRouter.generateClient().hello.sendnewData({message: "hi"}))



// Define Zod validation schemas


// Define Message Handlers
// Add WebSocket Route