import { WebSocketServer, WebSocket } from "ws";
import {
  date,
  optional,
  z,
  ZodObject,
  ZodUnknown,
  type ZodRawShape,
} from "zod";
import type { Port } from "../../types/networking/port.ts";
import type { WebsocketUrl } from "../../types/networking/urls/websocket.ts";
import type { ChannelConfig, TypedMessage } from "./types.ts";
import { WebsocketClient } from "./client.ts";
import type { IncomingMessage } from "http";
import { panic } from "../../utils/panic.ts";
import {
  Optionable,
  type none,
} from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/option.ts";
import type { keyofonlystringkeys } from "../../utils/metaprogramming/keyofonlystringkeys.ts";
import { GetSet, type inferType } from "../../utils/getSetClass.ts";
import { entries } from "../../utils/better-standard-library/mapObject.ts";
import { BetterArray } from "../../utils/better-standard-library/array.ts";

export class CustomWebsocketServer {}

export class CustomWebSocketRouter<
  ChannelNames extends string,
  Channels extends Record<
    ChannelNames,
    ChannelConfig<
      any,
      any,
      {
        validate: ZodObject<ZodRawShape>;
        validateResponse: ZodObject<ZodRawShape>;
      }
    >
  >,
  Context extends Record<ContextKeys, unknown>,
  ContextKeys extends string
> {
  public context: Context = {} as Context; // make private later
  public readonly channels: Channels;
  public j: Channels[keyof Channels][keyof Channels[keyof Channels]];
  private readonly handlers: GetSet<
    | ({
        beforeMessage?: (v: {
          ws: WebSocket;
          store: Context;
          message: TypedMessage<
            keyofonlystringkeys<Channels[keyof Channels]>,
            { [key: string]: unknown } & z.infer<
              Channels[keyof Channels]["hooks"]["validate"]
            >
          >;
        }) => void;
        afterMessage?: (v: {
          msg: TypedMessage<
            keyofonlystringkeys<Channels[keyof Channels]>,
            { [key: string]: unknown } & z.infer<
              Channels[keyof Channels]["hooks"]["validateResponse"]
            >
          >;
          ws: WebSocket;
        }) => void;
        onConnection: (ctx: {
          ws: WebSocket;
          req: IncomingMessage;
          store: Context;
        }) => void;
      } & {
        [Channel in keyof Channels]: {
          [Message in keyof Channels[Channel]["messagesItCanReceive"]]: (v: {
            data: z.infer<Channels[Channel]["messagesItCanReceive"][Message]>;
            store: Context;
          }) => void;
        };
      })
    | none
  > = new GetSet<
    | ({
        beforeMessage?: (v: {
          ws: WebSocket;
          store: Context;
          message: TypedMessage<
            keyofonlystringkeys<Channels[keyof Channels]>,
            { [key: string]: unknown } & z.infer<
              Channels[keyof Channels]["hooks"]["validate"]
            >
          >;
        }) => void;
        afterMessage?: (v: {
          msg: TypedMessage<
            keyofonlystringkeys<Channels[keyof Channels]>,
            { [key: string]: unknown } & z.infer<
              Channels[keyof Channels]["hooks"]["validateResponse"]
            >
          >;
          ws: WebSocket;
        }) => void;
        onConnection: (ctx: {
          ws: WebSocket;
          req: IncomingMessage;
          store: Context;
        }) => void;
      } & {
        [Channel in keyof Channels]: {
          [Message in keyof Channels[Channel]["messagesItCanReceive"]]: (v: {
            data: z.infer<Channels[Channel]["messagesItCanReceive"][Message]>;
            store: Context;
          }) => void;
        };
      })
    | none
  >(null, undefined, (v) => console.log("setting value"));

  constructor(endpoints: Channels, context?: Context) {
    this.channels = endpoints ?? ({} as Channels);
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
    Channels,
    Context & typeof object,
    ContextKeys & keyof T
  > {
    return new CustomWebSocketRouter(this.channels, {
      ...this.context,
      ...object,
    });
  }

  implement(handlers: typeof this.handlers.value) {
    this.handlers.setV(handlers);
    return this;
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
    this.handlers.map((handlers) => {
      new Optionable(handlers)
        .unpack("handlers not defined")
        .map((handlers) => {
          const wss = new WebSocketServer({ port: port.value });

          wss.on("connection", (ws, req) => {
            handlers.onConnection({ ws, req, store: this.context });

            ws.on("message", async (message) => {
              const parsedMessage = this.transformMsg(message.toString());

              new Optionable(parsedMessage).try({
                ifNone: () => {
                  this.sendUnprocessableMessageType(ws, {
                    channel: "unknown",
                    handler: "onMessageReceived",
                    msg: {
                      // error: `messages to this websockt server must follow the following shape {channel: string, message: string, payload: string}`
                    },
                  });
                },

                ifNotNone: async (parsedMessage) => {
                  new Optionable(handlers.beforeMessage).ifCanBeUnpacked((v) =>
                    v({ ws, store: this.context, message: parsedMessage })
                  );

                  new Optionable(
                    BetterArray.new(entries(this.channels)).filter(
                      ([channelName, channelConfig]) =>
                        channelName === parsedMessage.channel
                    ).normalArray[0]
                  ).try({
                    ifNone: () =>
                      console.log(
                        `thiere is no open channel called ${parsedMessage.channel}`,
                        JSON.stringify(parsedMessage)
                      ),

                    ifNotNone: ([channelName, channelConfig]) => {
                      new Optionable(
                        this.channels[channelName].messagesItCanReceive[
                          parsedMessage.message as keyof Channels[keyof Channels]
                        ]
                      ).try({
                        ifNone: () =>
                          console.log(
                            `channel ${JSON.stringify(
                              channelName
                            )} does not accept message type ${
                              parsedMessage.message
                            }`
                          ),

                        ifNotNone: (messageConfig) => {
                          console.log("f", messageConfig);
                          console.log("[][]",parsedMessage.payload)
                          messageConfig.parse(parsedMessage.payload);
                        },
                      });
                    },
                  });
                },
              });
            });

            ws.on("close", (code, reason) => {
              console.log(`WebSocket closed with code ${code}: ${reason}`);
            });
          });
        });
    });
  }

  getCLientBuilder(url: WebsocketUrl) {
    return new WebsocketClient<ChannelNames, Channels, {}>(url, this.channels);
  }
}
