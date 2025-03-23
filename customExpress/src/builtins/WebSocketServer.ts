import { WebSocketServer, WebSocket } from "ws";
import { z, ZodSchema, infer as ZodInfer, ZodObject, type ZodRawShape } from "zod";
import type { Port } from "../types/networking/port.ts";
import type { ApiPath } from "../types/apiApth.ts";
import { panic } from "../utils/panic.ts";
import type { Prefix } from "../types/prefix.ts";
import type { Url } from "../types/networking/url.ts";
import type { ExtractValueTypesFromRecord } from "../types/extractValueTypesFromRecord.ts";
import type { removeNonStringEntriesFromKeyOf } from "../types/removesNonStringKeysFromKeyOf.ts";

type InferMessages<T extends Record<string, ZodSchema>> = {
  [K in keyof T]: { type: K; data: ZodInfer<T[K]> };
};

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
  
  export type Client<MessagesThatTheServerCanSend extends Record<string, unknown>, MessagesTheServerCanHandle extends Record<string, unknown>> = {
    onReceivedMessage: Record<
      keyof MessagesThatTheServerCanSend,
      (ws: CustomWebsocket<MessagesTheServerCanHandle[keyof MessagesTheServerCanHandle]>) => void
    >,
    sendMsg(data: MessagesTheServerCanHandle[keyof MessagesTheServerCanHandle]): void
  }


  export interface ChannelConfig<
    TSend extends Record<unknown, ZodSchema>,
    TReceive extends Record<unknown, ZodSchema>
  > {
    messagesItCanSend: TSend;
    messagesItCanReceive: TReceive;
  }

  export class CustomWebSocketRouter<
    ChannelNames extends string,E extends Record<ChannelNames, ChannelConfig<any, any>>
  > {
    private port: Port;
    private wss: WebSocketServer;
    public endpoints: E;

    constructor(port: Port, endpoints: E) {
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

    addChannel<TSend, TRecieve,ChannelName extends ApiPath<string>>(name: ChannelName, channelConfig: ChannelConfig<TSend,TRecieve>): ChannelName["value"] extends keyof E ? never : CustomWebSocketRouter<ChannelNames & ChannelName, E & ChannelConfig<TSend, TRecieve>>{
      const res = Object.keys(this.endpoints).some(channelName => channelName === name.value)
      if (res) {
        panic(`channel name ${name} is alredy in use please use another name`)
      }

      return new customWebsocket.CustomWebSocketRouter(this.port, {
        ...this.endpoints,
        ...channelConfig 
      })
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

    generateClient(): Record<keyof E,
      Record<

        Prefix<removeNonStringEntriesFromKeyOf<keyof (E[keyof E]["messagesItCanReceive"])>, "send">, //TODO make this work so that we dont have squiggles
        // Prefix<keyof (E[keyof E]["messagesItCanReceive"]), "send">,
        (d: z.infer<ExtractValueTypesFromRecord<E[keyof E]["messagesItCanReceive"]>>) => Promise<void>>>
    {
      const obj:  Record<keyof E,Record<Prefix<keyof (E[keyof E]["messagesItCanReceive"]), "send">,(d: z.infer<ExtractValueTypesFromRecord<E[keyof E]["messagesItCanReceive"]>>) => Promise<void>>> = {}
      Object.entries(this.endpoints)
        .map(([channelName, channelConfig]) => {
          
          console.log(channelName,channelConfig.messagesItCanReceive)
          console.log("oooo`")
          return {
            name: channelName,
            messagesItCanReceive: channelConfig.messagesItCanReceive  
           }
         })
        .forEach(channelInfo => {
        // obj[channelInfo.name] = {
        //   dataSender: async (v) => {
        //     console.log("sending data", v)
        //   }
        // }
        
          Object.entries(channelInfo.messagesItCanReceive).forEach(([messageName, schema]) => {
            obj[channelInfo.name] = {
              ...obj[channelInfo.name],
              [`send${messageName}`]: (v: E[typeof channelInfo.name]["messagesItCanReceive"][typeof messageName]) => {
                // const validator = schema as ZodSchema<ZodRawShape>
                // const validationResult = validator.safeParse(v)
                // if (!v.error) {
                //   panic("sent data does not match the format if the message")
                // }
                try {
                  schema.parse(v)
                  console.log("sending data", schema)
                } catch (e) {
                  console.log(e)
                }
              } 
            }
        })
      })

  
      return obj

      }

generateListeners(
  path: Url,
  messageReceivers: Record<keyof E /* although it shows an error here this works */, (data: Prefix<E[keyof E]["messagesItCanReceive"]>) => void>
): 
  customWebsocket.Client<
  E[keyof E]["messagesItCanSend"], 
  E[keyof E]["messagesItCanReceive"]
>
    {
  const endpoint = this.endpoints[path.value];
  
  if (!endpoint) {
    throw new Error(`Endpoint ${path.value} not found`);
  }
  
  let ws: WebSocket | null = null;
  const handlers: Record<string, ((data: any) => void)[]> = {};
  
  return {
    onReceivedMessage: Object.fromEntries(
      Object.keys(endpoint.messagesItCanSend).map(type => [
        type,
        (websocket: CustomWebsocket<any>) => {
          const callbacks = handlers[type] || [];
          callbacks.forEach(callback => callback(websocket));
        }
      ])
    ) ,
    
    sendMsg(message) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }
      
      ws.send(JSON.stringify(message));
    }
  };
}


    getServer() {
      return this.wss;
    }
  }
}
