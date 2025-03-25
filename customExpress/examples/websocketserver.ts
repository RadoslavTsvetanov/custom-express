import { WebSocket } from "ws";
import { z, type TypeOf } from "zod";
import { customWebsocket } from "../src/builtins/WebSocketServer";
import { Port } from "../src/types/networking/port";
import { ApiPath } from "../src/types/apiApth";
import { Url } from "../src/types/networking/url";
import { GetSet } from "../src/utils/getSetClass";
import { unsafe } from "bun";

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
  userRoute: {
    messagesItCanReceive: {
      checkForInvalidUsersInRoom: z.object({
        roomId: z.number(),
        authKey: z.string(),
        userId: z.number()
      }),
      deleteUser: z.object({
        userId: z.string(),
        authKey: z.string()
      }) 
    },
    messagesItCanSend: {
      invalidUserDetected: z.object({
        userId: z.string()
      }),
      deletedUser: z.object({
        userId: z.string()
      })
    }
  }
})


// wsRouter.generateListeners(new Url(new GetSet("http://lovalhost:5000")), {
//   "hello": d => {
//     console.log(d);
//   }
// })

wsRouter.generateListeners(new Url(new GetSet("http://localhost:4000")), {
  helloRoute: {
    sendHelloTheOtherListeners: {
      handler: async v => {
      console.log(v.message)
      }
    },
    sayByeToRestOfTheListeners: {
      handler: async v => {
      console.log(v)
      }
    }
  },
  userRoute: {
    deletedUser: {
      handler: async v => {
      v
      }
    },
    invalidUserDetected: {
      handler: async v => {
      v
      },
      unsafe: true
    }
  }
})


const wsClient = wsRouter.generateClient()

console.log(await wsClient.helloRoute.newData({ message: ""}) )

console.log(await wsClient.helloRoute.newNotification({
  authToken: "abc",
  data: {
    metadata: "hello",
    message: "world"
  }
}))

console.log(await wsClient.userRoute.checkForInvalidUsersInRoom())


// Define Zod validation schemas


// Define Message Handlers
// Add WebSocket Route