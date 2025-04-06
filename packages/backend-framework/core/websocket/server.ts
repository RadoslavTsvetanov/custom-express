import { WebSocketServer, WebSocket } from "ws";
import { z, ZodObject, type ZodRawShape } from "zod";
import type { Port } from "../../types/networking/port.ts";
import type { WebsocketUrl } from "../../types/networking/urls/websocket.ts";
import type { ChannelConfig, TypedMessage } from "./types.ts";
import { WebsocketClient } from "./client.ts";
import type { IncomingMessage } from "http";
import {
  ifNotNone,
  Optionable,
  type none,
} from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/option.ts";
import type { keyofonlystringkeys } from "../../utils/metaprogramming/keyofonlystringkeys.ts";
import { GetSet } from "../../../../packages/better-standard-library/data_structures/getSetClass.ts";
import { entries } from "../../../../packages/better-standard-library/mapObject.ts";
import { BetterArray } from "../../utils/better-standard-library/array.ts";
import type { VCallback } from "../../../../packages/better-standard-library/types/voidcallback.ts";
import type {
  IMapable,
  ISimpleMapable,
} from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/mapable.ts";
import { IPipeable } from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/pipe.ts";
import { AsyncAPIDocument } from "../../types/asyncapi/msin.ts";
import { OrderedRecord } from "../../utils/better-standard-library/RecordCompatibeArray.ts";

type MessageHandler = {
  hooks: ServerHooks<>;
  handler: (v: unknown) => unknown;
};

type ServerHooks<
  BeforeRequest extends OrderedRecord<[], unknown>,
  AfterRequest extends OrderedRecord<[], unknown>,
  Errors extends string
> = {
  beforeRequest: BeforeRequest; //
  afterRequest: AfterRequest;
  onError: (x: Errors) => void;
};

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
  ContextKeys extends string,
  BaseRequest = {}
> implements
    ISimpleMapable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >,
    IPipeable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >,
    IMapable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>,
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >
{
  public context: Context = {} as Context; // make private later
  public readonly channels: Channels;
  private hooks: ServerHooks<>;
  // private hooks: {
  //   // note Register hook into every handler of the current instance that came after. so any handler added before the hook wont be in the scope if the hook
  //   before?: {
  //     // this runs before any kind of transformation is done to an incoming message
  //     validation?: VCallback<{ ws: WebSocket, message: string }>,
  //     transform?: <ReturnType>(message: TypedMessage<any, unknown>) => ReturnType // this runs before every send of the built in clint for sending messages so it is good in cases where you want to add a field to any of the messagesItCanSend without explicitely doing it everywhere

  //     // , it is helpful for early returns and things like that
  //     /*

  //     */
  //     handleMessage?: VCallback<{
  //       ws: WebSocket;
  //       store: Context;
  //       message: TypedMessage<
  //         keyofonlystringkeys<Channels[keyof Channels]>,
  //         { [key: string]: unknown } & z.infer<
  //           Channels[keyof Channels]["hooks"]["validate"]
  //         >
  //       >;
  //     }>;
  //   },
  //   afterMessage?: VCallback<{ // called directly after a message handler is executed
  //     msg: TypedMessage<
  //       keyofonlystringkeys<Channels[keyof Channels]>,
  //       { [key: string]: unknown } & z.infer<
  //         Channels[keyof Channels]["hooks"]["validateResponse"]
  //       >
  //     >;
  //     ws: WebSocket;
  //   }>;
  //   onConnection: VCallback<{
  //     ws: WebSocket;
  //     req: IncomingMessage;
  //     store: Context;
  //   }>;
  // }
  private readonly handlers: GetSet<
    // TODO seperate the first object tyoe into one called hooks
    | ({
        before?: {
          validation?: VCallback<{ ws: WebSocket; message: string }>; // this runs before any kind of transformation is done to an incoming message
          // TODO: add the rest,
          transform?: <ReturnType>(
            message: TypedMessage<any, unknown>
          ) => ReturnType; // ran after validate of a channel so it recieves a message of type validated
          // , it is helpful for early returns and things like that
          /* For example you have a user channel and you want to pass a user DTO directly to every subsiquent message handler you would do it like thid 

      (msg: typeof channel.validate) => {
        returm {ws: ws, msg: {...msg, user: UserService.getUser(msg.userId // this userid is ensured to be there from the validate of the channel)} }
      }

        */
          message?: VCallback<{
            ws: WebSocket;
            store: Context;
            message: TypedMessage<
              keyofonlystringkeys<Channels[keyof Channels]>,
              { [key: string]: unknown } & z.infer<
                Channels[keyof Channels]["hooks"]["validate"]
              >
            >;
          }>;
        };
        after?: {
          Message?: VCallback<{
            msg: TypedMessage<
              keyofonlystringkeys<Channels[keyof Channels]>,
              { [key: string]: unknown } & z.infer<
                Channels[keyof Channels]["hooks"]["validateResponse"]
              >
            >;
            ws: WebSocket;
          }>;
        };
        onConnection: VCallback<{
          ws: WebSocket;
          req: IncomingMessage;
          store: Context;
        }>;
      } & {
        [Channel in keyof Channels]: {
          [Message in keyof Channels[Channel]["messagesItCanReceive"]]: (v: {
            data: z.infer<Channels[Channel]["messagesItCanReceive"][Message]> &
              Channels[Channel]["hooks"]["validate"] /* here place the return type of transform in before since it is transforms every message to this */;
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

  public plug<
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
  >(
    app: CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
  ): CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> {
    // Merging logic can be added here if necessary
    // For example, copying handlers or other properties from `app` to this instance

    // Return a new instance of CustomWebSocketRouter
    return new CustomWebSocketRouter<
      ChannelNames,
      Channels,
      Context,
      ContextKeys
    >(this.channels, this.context);
  }

  map(
    func: (
      v: CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    ) => CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
  ): CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> {
    return func(this);
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

  private transformMsg(
    v: string
  ): Optionable<
    TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
  > {
    try {
      return new Optionable(JSON.parse(v));
    } catch {
      return new Optionable<
        TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
      >(null);
    }
  }

  pipe(
    handler: VCallback<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >
  ) {
    return handler(this);
  }

  simpleMap(
    func: (
      v: CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    ) => CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
  ): CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> {
    return func(this);
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

  start(port: Port) {
    this.handlers.map((handlers) => {
      new Optionable(handlers)
        .unpack("handlers not defined")
        .map((handlers) => {
          const wss = new WebSocketServer({ port: port.value });

          wss.on("connection", (ws, req) => {
            handlers.onConnection({ ws, req, store: this.context });

            ws.on("message", async (message) => {
              ifNotNone(handlers.before?.validation, (handler) =>
                handler({ ws, message: message.toString() })
              );

              this.transformMsg(message.toString()).try({
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
                  new Optionable(handlers.before?.message).ifCanBeUnpacked(
                    (v) =>
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
                          console.log("[][]", parsedMessage.payload);
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

  // it hahves like elysia plugins
  // usefull for adding big batches of context for example e,g, a big store which you have reused previously, for example all of services for interacting with a auth provider which you are reusing

  addChannel<NewName extends readonly string>(config: {
    name: NewName;
    handlers: {
      [x: string]: {};
    };
    hooks: ServerHooks;
  }) {}
}

export class AsynApiDefined<
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
> extends CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> {
  constructor(channels: Channels, context?: Context) {
    super(channels, context);
    // You can now do custom things with `this.channels` or `this.context`
  }

  // Example of an additional method

  get definition(): AsyncAPIDocument {
    return this.channels;
  }
}
