import { WebSocketServer, WebSocket } from "ws";
import { date, z } from "zod";
import type { Port } from "../../types/networking/port.ts";
import type { WebsocketUrl } from "../../types/networking/urls/websocket.ts";
import type { ChannelConfig, TypedMessage } from "./types.ts";
import { WebsocketClient } from "./client.ts";

class CustomWebsocket<MessagesThatCanSent> {
  readonly ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  typeSafeSend(data: MessagesThatCanSent) {
    this.ws.send(JSON.stringify(data));
  }
}


  export class CustomWebSocketRouter<
    ChannelNames extends string,
    E extends Record<ChannelNames, ChannelConfig<any, any>>
  > {
    public endpoints: E;
    readonly handlers: {
      [Channel in keyof E]: {
        [Message in keyof E[Channel]["messagesItCanReceive"]]: (
          v: z.infer<E[Channel]["messagesItCanReceive"][Message]>
        ) => void;
      };
    };
    constructor(
      endpoints: E,
      handlers: {
        [Channel in keyof E]: {
          [Message in keyof E[Channel]["messagesItCanReceive"]]: (
            v: z.infer<E[Channel]["messagesItCanReceive"][Message]>
          ) => void;
        };
      }
    ) {
      this.handlers = handlers;
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

    // addChannel<TSend, TRecieve, ChannelName extends ApiPath<string>>(
    //   name: ChannelName,
    //   channelConfig: ChannelConfig<TSend, TRecieve>
    // ): ChannelName["value"] extends keyof E
    //   ? never
    //   : CustomWebSocketRouter<
    //     ChannelNames & ChannelName,
    //     E & ChannelConfig<TSend, TRecieve>
    //   > {
    //   const res = Object.keys(this.endpoints).some(
    //     (channelName) => channelName === name.value
    //   );
    //   if (res) {
    //     panic(`channel name ${name} is alredy in use please use another name`);
    //   }

    //   return new customWebsocket.CustomWebSocketRouter(this.port, {
    //     ...this.endpoints,
    //     ...channelConfig,
    //     ...this.handlers.
    //   });
    // }

    start(port: Port) {
      const wss = new WebSocketServer({ port: port.value}) 
      console.log("ko")
      wss.on("connection", (ws) => {
        ws.on("message", async (message) => {
          console.log("msg")
          const parsedMessage = this.transformMsg(message.toString());
          console.log("parsed",parsedMessage)
          if (!parsedMessage) {
            this.sendUnprocessableMessageType(ws, {
              channel: "unknown",
              handler: "onMessageReceived",
              msg: {},
            });
            return;
          }

          for (const [channel, endpoint] of Object.entries(this.endpoints)) {
            const schema =
              endpoint.messagesItCanReceive[
                parsedMessage.message as keyof typeof endpoint.messagesItCanReceive
              ];

            if (!schema) continue; // Skip channels that don't handle this message type

            const validationResult = schema.safeParse(parsedMessage.payload);
            if (!validationResult.success) {
              ws.send(
                JSON.stringify({
                  error: "Invalid message format",
                  details: validationResult.error.format(),
                })
              );
              return;
            }

            const handler = this.handlers[channel as keyof E[keyof E]["messagesItCanSend"]]?.[parsedMessage.message.toString()];
            console.log(this.handlers[channel])
            console.log(this.handlers[channel][message.toString()])
            if (handler) {
              try {
                const customWs = new CustomWebsocket(ws);
                await handler(validationResult.data);
              } catch (error) {
                ws.send(
                  JSON.stringify({
                    error: "Handler execution failed",
                    details: (error as Error).message,
                  })
                );
              }
            } else {
              console.log("didnt find handler for this mesage", 
                parsedMessage
              )
              this.sendUnprocessableMessageType(ws, {
                channel,
                handler: "onMessageReceived",
                msg: parsedMessage,
              });
            }
          }
        });

        ws.on("close", (code, reason) => {
          console.log(`WebSocket closed with code ${code}: ${reason}`);
        });
      });
    }

    
    getCLientBuilder(url: WebsocketUrl) {
      return new WebsocketClient<ChannelNames,E,{}>(url, this.endpoints)
    }

  }