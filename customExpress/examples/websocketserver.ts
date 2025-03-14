import { WebSocket } from "ws";
import { z } from "zod";
import { customWebsocket } from "../src/builtins/WebSocketServer";
import { Port } from "../src/types/networking/port";
import { ApiPath } from "../src/types/apiApth";

// Define WebSocket Port
const port = { value: 8080 };

// Create WebSocket Router
const wsRouter = new customWebsocket.CustomWebSocketRouter(new Port(5555))

// Define Zod validation schemas


const exitSchema = z.object({
  reason: z.string(),
});

// Define API Path


// Define Message Handlers
// Add WebSocket Route
wsRouter.addRoute(
  new ApiPath("/g"),
  {
    onConnection: (ws: WebSocket) => {
      console.log("Client connected");
      ws.send(JSON.stringify({ type: "welcome", message: "Welcome to the WebSocket server!" }));
    },
    onExit: (ws: WebSocket, code: number, message: string) => {
      console.log(`Client disconnected: ${code}, Reason: ${message}`);
    },
    onMsgReceived: {
      chatMessage: (ws, msg) => {
        msg.data.data.hi
      },
      ping: (ws, msg) => {
        ws.send(JSON.stringify({ type: "pong", data: msg.data }));
      }
    },
  },
  {
    messagesItCanReceive: {
      chatMessage: z.object({
        type: z.literal("chatMessage"),
        data: z.object({
          hi: z.string()
        }),
      }),
      ping: {
        type: z.literal("ping"),
        data: z.string(),
      },
    },
    messagesItCanSend: {
      chatMessage: z.object({
        type: z.literal("chatMessage"),
        data: z.object({
          type: z.literal("chatMessage"),
          data: z.string(),
        })
      }),
      pong: {
        type: "pong",
        data: z.string(),
      },
    }
  }
)