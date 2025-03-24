import { WebSocket } from "ws";
import { z, type TypeOf } from "zod";
import { customWebsocket } from "../src/builtins/WebSocketServer";
import { Port } from "../src/types/networking/port";
import { ApiPath } from "../src/types/apiApth";
import { Url } from "../src/types/networking/url";
import { GetSet } from "../src/utils/getSetClass";

// Define WebSocket Port
const port = { value: 8080 };

// Create WebSocket Router
const wsRouter = new customWebsocket.CustomWebSocketRouter(new Port(5555), {
  helloRoute: {
    messagesItCanReceive: {
      newData: z.object({
        message: z.string().min(20)
      }),
      newNotification: z.object({
        authToken: z.string(),
        data: z.object({
          metadata: z.string(),
          message: z.string()
        })
      })
      
    },
    messagesItCanSend: {
      sendHelloTheOtherListeners: z.object({
        message: z.string().nonempty()
      }),
      sayByeToRestOfTheListeners: z.object({
        byeConfig: z.object({
          people: z.array(z.string())
        })
      })
    }
  },
  
})


// wsRouter.generateListeners(new Url(new GetSet("http://lovalhost:5000")), {
//   "hello": d => {
//     console.log(d);
//   }
// })


wsRouter.generateListeners(new Url(new GetSet("http://localhost:4000")), {
  // onhello: v => {
  //   v.message
  // },
  sendHelloTheOtherListeners: async v => {
    v.message
  },
  sayByeToRestOfTheListeners: async v => {
    v
 } 

})


const wsClient = wsRouter.generateClient()

console.log(await wsClient.helloRoute.newData({
  message: "hi"
}))

console.log(await wsClient.helloRoute.newNotification({
  authToken: "abc",
  data: {
    metadata: "hello",
    message: "world"
  }
}))


// Define Zod validation schemas


// Define Message Handlers
// Add WebSocket Route