import { WebSocketServer, WebSocket } from "ws";
import {
  z,
  ZodSchema,
  infer as ZodInfer,
  ZodObject,
  type ZodRawShape,
} from "zod";
import type { Port } from "../types/networking/port.ts";
import type { ApiPath } from "../types/apiApth.ts";
import { panic } from "../utils/panic.ts";
import type { Prefix, PrefixKeysOfRecord } from "../metaprogramming/prefix.ts";
import type { Url } from "../types/networking/url.ts";
import type { ExtractValueTypesFromRecord } from "../metaprogramming/extractValueTypesFromRecord.ts";
import type { removeNonStringEntriesFromKeyOf } from "../metaprogramming/removesNonStringKeysFromKeyOf.ts";
import type { Pair, transform } from "../metaprogramming/pair.ts";
import type { TuplifyUnion } from "../metaprogramming/unionintotuple.ts";
import { Channel } from "node:diagnostics_channel";
import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";

type InferMessages<T extends Record<string, ZodSchema>> = {
  [K in keyof T]: { type: K; data: ZodInfer<T[K]> };
};



export type FunctionArgsArray<T extends string | number> = {
  [K in T]: (arg: K) => void;
}[T][];

type FnArray<T extends any[]> = { [K in keyof T]: (arg: T[K]) => void };

interface TypedMessage<T extends string, D> {
  type: T;
  data: D;
}

class CustomWebsocket<MessagesThatCanSent> {
  readonly ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  typeSafeSend(data: MessagesThatCanSent) {
    this.ws.send(JSON.stringify(data));
  }
}

export namespace customWebsocket {

  export class WebsocketListener {
    private ws
    constructor(ws) {
      this.ws = ws
    }

    startListening() {
      this.ws.
    }
  }
  
  export interface ChannelConfig<
    TSend extends Record<keyof TSend, ZodSchema>,
    TReceive extends Record<keyof TReceive, ZodSchema>
  > {
    messagesItCanSend: TSend;
    messagesItCanReceive: TReceive;
  }

  export class CustomWebSocketRouter<
    ChannelNames extends string,
    E extends Record<ChannelNames, ChannelConfig<any, any>>
  > {
    private port: Port;
    private wss: WebSocketServer;
    public endpoints: E;

    constructor(port: Port, endpoints: E,/* handlers: transform<E[keyof E]["messagesItCanReceive"]> */) {
      this.port = port;
      this.wss = new WebSocketServer({ port: port.value });
      this.endpoints = endpoints ?? ({} as E);
    }

    private sendUnprocessableMessageType(
      ws: WebSocket,
      invocationInfo: { channel: string; msg: object; handler: string }
    ) {
      ws.send(
        JSON.stringify({
          error: "Cannot find handler to process message",
          invocationData: invocationInfo,
        })
      );
    }

    private transformMsg(v: string): TypedMessage<string, unknown> | null {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }

    addChannel<TSend, TRecieve, ChannelName extends ApiPath<string>>(
      name: ChannelName,
      channelConfig: ChannelConfig<TSend, TRecieve>
    ): ChannelName["value"] extends keyof E
      ? never
      : CustomWebSocketRouter<
        ChannelNames & ChannelName,
        E & ChannelConfig<TSend, TRecieve>
      > {
      const res = Object.keys(this.endpoints).some(
        (channelName) => channelName === name.value
      );
      if (res) {
        panic(`channel name ${name} is alredy in use please use another name`);
      }

      return new customWebsocket.CustomWebSocketRouter(this.port, {
        ...this.endpoints,
        ...channelConfig,
      });
    }

    start() {
      this.wss.on("connection", (ws) => {
        for (const [path, endpoint] of Object.entries(this.endpoints)) {
          const handlers = endpoint as any; // Will be properly typed in the route handlers

          // Call onConnection handler if it exists
          if (handlers.onConnection) {
            handlers.onConnection(ws);
          }

          ws.on("message", async (message) => {
            const parsedMessage = this.transformMsg(message.toString());

            if (!parsedMessage) {
              this.sendUnprocessableMessageType(ws, {
                channel: path,
                handler: "onMessageReceived",
                msg: {},
              });
              return;
            }

            const { type, data } = parsedMessage;
            const validator = endpoint.messagesItCanReceive;
            const schema = validator[type];

            if (!schema) {
              this.sendUnprocessableMessageType(ws, {
                channel: path,
                handler: "onMessageReceived",
                msg: parsedMessage,
              });
              return;
            }

            const validationResult = schema.safeParse(data);
            if (!validationResult.success) {
              ws.send(
                JSON.stringify({
                  error: "Invalid message format",
                  details: validationResult.error.format(),
                })
              );
              return;
            }

            const handler = handlers.onMsgReceived?.[type];

            if (handler) {
              try {
                const customWs = new CustomWebsocket(ws);
                await handler(customWs, {
                  type,
                  data: validationResult.data,
                });
              } catch (error) {
                ws.send(
                  JSON.stringify({
                    error: "Handler execution failed",
                    details: (error as Error).message,
                  })
                );
              }
            } else {
              this.sendUnprocessableMessageType(ws, {
                channel: path,
                handler: "onMessageReceived",
                msg: parsedMessage,
              });
            }
          });

          ws.on("close", (code, reason) => {
            if (handlers.onExit) {
              handlers.onExit(ws, code, reason.toString());
            }
          });
        }
      });
    }

generateClient():
  {
    [Channel in keyof E]: {
      [Message in keyof E[Channel]["messagesItCanReceive"]]: (
        d: z.infer<E[Channel]["messagesItCanReceive"][Message]>
      ) => void;
    };
  } {
  const client: any = {};

  Object.entries(this.endpoints).forEach(([channelName, channelConfig]) => {
    client[channelName] = {};

    Object.entries(channelConfig.messagesItCanReceive).forEach(
      ([messageName, schema]) => {
        client[channelName][messageName] = async (
          data: z.infer<typeof schema>
        ) => {
          try {
            schema.parse(data);
            console.log(`Sending message to ${channelName}:`, {
              type: messageName,
              data,
            });
          } catch (error) {
            console.error(`Invalid message format for ${messageName}:`, error);
          }
        };
      }
    );
  });

  return client;
}



    generateListeners(
      path: Url,
      messageReceivers: {
  [Channel in keyof E]: {
          [Message in keyof E[Channel]["messagesItCanSend"]]: {
            handler: (d: z.infer<E[Channel]["messagesItCanSend"][Message]>) => Promise<void>,
            unsafe? : boolean = false // since zod validation happens on both sides this stells the client to proceed the message even if it is not according to the schema 
          }
        }
} 
    ): WebsocketListener {
const ws = new WebSocket(path.toString());
  const listener = new WebsocketListener(ws);

  ws.onopen = () => {
    console.log("WebSocket connection established:", path);
  };

  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data.toString());
      const { channel, message, payload } = data as {
        channel: keyof E,
        message: E[keyof E]["messagesItCanSend"],
        payload: E[keyof E]["messagesItCanSend"][keyof E[keyof E]["messagesItCanSend"]]
      };
      
      if (
        channel in messageReceivers &&
        message in messageReceivers[channel]
      ) {


        // if (messageReceivers[channel][message].unsafe === false)  { // a bit strange but if i just place ! when its undefined it wont do thje check but it should 
          try {

        
            (this.endpoints[channel][message].parse(payload))
        await messageReceivers[channel][message].handler(payload)
          } catch (e) {
            if (messageReceivers[channel][message].unsafe) {
              console.log("message does not match defined schema", JSON.stringify(payload))
        await messageReceivers[channel][message].handler(payload)
            }
          }
        // }
        
      } else {
        console.warn("Unhandled message:", data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return listener;

    }

    getServer() {
      return this.wss;
    }
  }
}
