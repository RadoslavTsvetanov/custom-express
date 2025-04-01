import { WebSocketServer, WebSocket } from "ws";
import { date, optional, z, ZodObject, ZodUnknown, type ZodRawShape } from "zod";
import type { Port } from "../../types/networking/port.ts";
import type { WebsocketUrl } from "../../types/networking/urls/websocket.ts";
import type { ChannelConfig, TypedMessage } from "./types.ts";
import { WebsocketClient } from "./client.ts";
import type { IncomingMessage } from "http";
import { panic } from "../../utils/panic.ts";
import { Optionable, type none } from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/option.ts";
import type { keyofonlystringkeys } from "../../utils/metaprogramming/keyofonlystringkeys.ts";
import { GetSet, type inferType } from "../../utils/getSetClass.ts";

export class CustomWebsocketServer{

}

export class CustomWebSocketRouter<
  ChannelNames extends string,
  E extends Record<
    ChannelNames,
    ChannelConfig<
      any,
      any,
      // {
        // validate: ZodObject<ZodRawShape>,
        // validateResponse: ZodObject<ZodRawShape>
    // }
      {
        validate: ZodObject<ZodRawShape>,
        validateResponse: ZodObject<ZodRawShape>
      }
    >
  >,
  Context extends Record<ContextKeys, unknown>,
  ContextKeys extends string
> {
  public context: Context = {} as Context; // make private later
  public readonly endpoints: E;
  private readonly handlers:
    GetSet<({
      beforeMessage?: (v: {
        ws: WebSocket;
        store: Context;
        message: TypedMessage<
          keyofonlystringkeys<E[keyof E]>, { [key: string]: unknown }
          &
          z.infer<E[keyof E]["hooks"]["validate"]>
        >;
      }) => void,
      afterMessage?: (v: {
        msg: TypedMessage<
          keyofonlystringkeys<E[keyof E]>, { [key: string]: unknown }
          &
          z.infer<E[keyof E]["hooks"]["validateResponse"]>
        >,
        ws: WebSocket
      }) => void
      onConnection: (ctx: {
        ws: WebSocket;
        req: IncomingMessage;
        store: Context;
      }) => void;
    } & {
      [Channel in keyof E]: {
        [Message in keyof E[Channel]["messagesItCanReceive"]]: (v: {
          data: z.infer<E[Channel]["messagesItCanReceive"][Message]>;
          store: Context;
        }) => void;
      };
    })
    | none> = new GetSet<({
      beforeMessage?: (v: {
        ws: WebSocket;
        store: Context;
        message: TypedMessage<
          keyofonlystringkeys<E[keyof E]>, { [key: string]: unknown }
          &
          z.infer<E[keyof E]["hooks"]["validate"]>
        >;
      }) => void,
      afterMessage?: (v: {
        msg: TypedMessage<
          keyofonlystringkeys<E[keyof E]>, { [key: string]: unknown }
          &
          z.infer<E[keyof E]["hooks"]["validateResponse"]>
        >,
        ws: WebSocket
      }) => void
      onConnection: (ctx: {
        ws: WebSocket;
        req: IncomingMessage;
        store: Context;
      }) => void;
    } & {
      [Channel in keyof E]: {
        [Message in keyof E[Channel]["messagesItCanReceive"]]: (v: {
          data: z.infer<E[Channel]["messagesItCanReceive"][Message]>;
          store: Context;
        }) => void;
      };
    })
    | none> (null, undefined, (v) => console.log("setting value"));

  constructor(endpoints: E, context?: Context) {
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

  store<T extends Record<string, unknown>>(
    object: T
  ): CustomWebSocketRouter<
    ChannelNames,
    E,
    Context & typeof object,
    ContextKeys & keyof T
  > {
    return new CustomWebSocketRouter(this.endpoints, {
      ...this.context,
      ...object,
    });
  }

  implement(handlers: typeof this.handlers.value) {
    this.handlers.setV(handlers)
    console.log("iooi", this.handlers);
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
    this.handlers
      .map(
        handlers => new Optionable(handlers)
        .unpack("handlers not defined")
        .map((handlers) => {
        const wss = new WebSocketServer({ port: port.value });
        console.log("ko");

        wss.on("connection", (ws, req) => {
          handlers.onConnection({ ws, req, store: this.context });

          ws.on("message", async (message) => {
            const parsedMessage = this.transformMsg(message.toString());

            new Optionable(parsedMessage).try({
              ifNone: () => {
                this.sendUnprocessableMessageType(ws, {
                  channel: "unknown",
                  handler: "onMessageReceived",
                  msg: {},
                });
              },
              ifNotNone: async (parsedMessage) => {
                new Optionable(handlers.beforeMessage).ifCanBeUnpacked((v) =>
                  v({ ws, store: this.context, message: parsedMessage })
                );

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

                  new Optionable(
                    handlers[channel as keyof E[keyof E]["messagesItCanSend"]]?.[
                      parsedMessage.message.toString()
                    ]
                  ).try({
                    ifNone: () => {
                      console.log("Didn't find handler for this message", parsedMessage);
                      this.sendUnprocessableMessageType(ws, {
                        channel,
                        handler: "onMessageReceived",
                        msg: parsedMessage,
                      });
                    },
                    ifNotNone: async (handler) => {
                      await handler({
                        data: validationResult.data,
                        store: this.context,
                      })
                      new Optionable(handlers.afterMessage).ifCanBeUnpacked(callback => callback(parsedMessage))
                    },
                  });
                }
              },
            });
          });

          ws.on("close", (code, reason) => {
            console.log(`WebSocket closed with code ${code}: ${reason}`);
          });
        });
    }))
}


  getCLientBuilder(url: WebsocketUrl) {
    return new WebsocketClient<ChannelNames, E, {}>(url, this.endpoints);
  }
}
