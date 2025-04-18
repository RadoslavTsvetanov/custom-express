import { WebSocketServer, WebSocket } from "ws";
import { object, z, ZodObject, type ZodRawShape } from "zod";
import { BetterArray, entries, GetSet, ifNotNone, keyofonlystringkeys, map, Optionable, panic, Port, VCallback, WebsocketUrl } from "@custom-express/better-standard-library"
import { HookBuilder } from "../utilites/builders/HookBuilder";
import { BaseHookBundle, BaseMessageHooks, GlobalHooks, Hook, HookOrderedRecord, HookOrderedRecordEntry, MessageHooks, ServerHooks } from "../../types/Hooks/main";
import { ChannelConfig } from "../../types/Channel/main";
import { MessageItCanReceive, MessageThatCanBeSent, TypedMessage } from "../../types/Message/main";
import { runHookHandler, runOrderedHooks } from "./helpers";
import { WebsocketClient } from "../../client";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";
import { ChannelBuilder } from "../utilites/builders/ChannekBuilder";
import { MessageThatCanBeReceivedBuilder } from "../utilites/builders/MessageBuilder";


// ---------
// This is the core class with only domain/bussiness logic e.g. without any utilities like map pipe etc... to see them go below to CustomWebsocketRouter where they are implemented i decided
// --------
export class CustomWebSocketRouter<
  Channels extends Record<
    string,
    ChannelConfig<
      Record<string, ZodObject<ZodRawShape>>,
      Record<string, MessageItCanReceive<MessageHooks<BaseHookBundle, BaseHookBundle>,unknown>>,
      Partial<ServerHooks<BaseHookBundle, BaseHookBundle>>
      >
  >,
  Context extends Record<string, unknown>,
  Hooks extends GlobalHooks
// BeforeHandle extends Hook<TypedMessage<unknown, unknown>,UnknownRecord>,
> {
  public readonly prefix: GetSet<Optionable<string>>

  Prefix(prefix: string): (typeof this.prefix)["value"] extends string ? never : this { // this is because you cant set a second prefix to an instance // TODO mamke it so that in the future when you prefix it does not return an instance on which you can call prefix at all
    this.prefix.setV(new Optionable(prefix))
    return this
  }
  protected context: Context = {} as Context; // make private later
  public readonly channels: Channels;
  public hooks: Optionable<GlobalHooks> = new Optionable(null);

  constructor(endpoints: Channels, context?: Context) {
    this.channels = endpoints ?? ({} as Channels);
  }

  public plug<
    NewChannels extends Record<
      string,
      ChannelConfig<
        any,
        any,
        {
          validate: ZodObject<ZodRawShape>;
          validateResponse: ZodObject<ZodRawShape>;
        }
      >
    >,
    NewContext extends Record<string, unknown>,
  >(
    app: CustomWebSocketRouter<Channels, Context>
  ): CustomWebSocketRouter<Channels & NewChannels, Context & NewContext> {
    // Merging logic can be added here if necessary
    // For example, copying handlers or other properties from `app` to this instance

    // Return a new instance of CustomWebSocketRouter
    return new CustomWebSocketRouter
      ({
        ...this.channels,
        ...app.channels
      }, {
        ...this.context,
        ...app.context
      });
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

  store<T extends Record<string, unknown>>(
    object: T
  ): CustomWebSocketRouter<
    Channels,
    Context & { [Key in keyof T]: T[Key] }
  > {
    return new CustomWebSocketRouter(this.channels, {
      ...this.context,
      ...object,
    });
  }

  start(port: Port) {
    const h = this.channels

    Object.entries(this.channels).forEach(([channelName, channelConfig]) => {
      new Optionable(channelConfig)
        .ifCanBeUnpacked(handlers => {
          const wss = new WebSocketServer({ port: port.value });

          wss.on("connection", (ws, req) => {

            this.hooks.ifCanBeUnpacked(({ onConnection }) => {
              runHookHandler(onConnection, { ws, message: req });
            });
            
            ws.on("message", async (message) => {
              // TODO: Add a hook here to intercept message pre-parsing
              console.log("mgfg",message, )
              this.transformMsg(message.toString()).try({
                ifNone: () => {
                  this.sendUnprocessableMessageType(ws, {
                    channel: "unknown",
                    handler: "onMessageReceived",
                    msg: {},
                  });
                },

                ifNotNone: async (parsedMessage) => {
                  try {
                    this.hooks.ifCanBeUnpacked(({ beforeHandle }) => {
                      map(beforeHandle, hook => {
                        runHookHandler(hook, { ws, message: parsedMessage });
                      });
                    });
                    new Optionable(
                      BetterArray
                        .new(Object.entries(this.channels))
                        .tick(v => console.log("ooo"))
                        .filter(([channelName]) => channelName === parsedMessage.channel)
                        .at(0)
                    ).try({
                      ifNone: () =>
                        console.log(`No open channel called ${parsedMessage.channel}`, parsedMessage),

                      ifNotNone: ([channelName, channelConfig]) => {
                        new Optionable(
                          channelConfig.messagesItCanReceive[parsedMessage.message]
                        ).try({
                          ifNone: () =>
                            console.log(`Channel ${channelName} does not accept message type ${parsedMessage.message}`),

                          ifNotNone: ({ config }) => {
                            map(config, ({ handler, hooks: { beforeHandler, afterHandler } }) => {
                              map(runHookHandler(beforeHandler, { ws, message: parsedMessage }), result => {
                                console.log("passing received", parsedMessage)
                                map(handler(result), result => {
                                  
                                map(runHookHandler(afterHandler, { ws, message: result }), result => {

                              this.hooks.ifCanBeUnpacked(({ afterHandle }) => {
                                    map(afterHandle, hook => {
                                      runHookHandler(hook, { ws, msg: result });
                                    });
                                  });
                                })
                                })
                              })
                            });
                          },
                        });
                      },
                    });
                  } catch (err) {
                    console.log(err)
                    this.hooks.ifCanBeUnpacked(({ onError }) => onError(err));
                  }
                },
              });
            });

            ws.on("close", (code, reason) => {
              this.hooks.ifCanBeUnpacked(({ onClose }) => {
                runHookHandler(onClose, {
                  ws,
                  message: { code, reason: reason.toString() },
                });
              });
            });
          });
        });
    });
  }


  getCLientBuilder(url: WebsocketUrl) {
    return new WebsocketClient<Channels,{}>(url, this.channels);
  }

  // it hahves like elysia plugins
  // usefull for adding big batches of context for example e,g, a big store which you have reused previously, for example all of services for interacting with a auth provider which you are reusing

  addChannel<
    // Config extends { name:  string }, // try putting the  below generic here for a bit more cleannes
    NewName extends string,
    NewChannel extends ChannelConfig<
      Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
      Record<
        string,
        MessageItCanReceive<
          BaseMessageHooks,
          unknown
        >
      >,
      Partial<ServerHooks<
        BaseHookBundle,
        BaseHookBundle,
        string
      >>
    >
  >
    (name: NewName, config: NewChannel): NewName extends keyof Channels
    ? never
    : CustomWebSocketRouter<
      Channels & Record<NewName, NewChannel>,
      Context,
      Hooks
    > {
    Object.entries(this.channels).forEach(([channelName, value]) => {
      if (channelName === name) {
        panic(`Channel ${channelName} is already defined`)
      }
    })
    return new CustomWebSocketRouter(
      {
        ...this.channels,
        [name as NewName]: { ...config }
      },
      this.context
    )
  }

}

// move to tests
// {
//   const g = new CustomWebSocketRouter({}).addChannel(
//     "channel-1",
//     {
//       hooks: {
//         beforeHandle: {
//           ordered: HookBuilder.new().add({ key: "lolo", execute: v => { return { hi: "" } as const } } as const).build(),
//           independent: []
//         }
//       },
//       messagesItCanReceive: {
//         puki: new MessageThatCanBeReceivedBuilder(
//           {
//             afterHandler: {
//               ordered: HookBuilder
//                 .new()
//                 .add({ key: "ojjoi", execute: v => { return { ko: "" } } })
//                 .build(),
//               independent: []
//             },
//             "beforeHandler": {
//               ordered: HookBuilder
//                 .new()
//                 .add({ key: "iooi", execute: v => { return { lolo: "" } as const } } as const)
//                 .build(),
//               independent: []
//             } as const,
//             onErrorr: v => ""
//           },
//           v => { }
//         ).build()
//       },
//       messagesItCanSend: {
//         puki: z.object({
//           puki: z.string()
//         })
//       }
//     }
//   )


//   const h = g.channels["channel-1"].hooks.beforeHandle.ordered.elements.value[0]
//   {
//     const h = g.channels["channel-1"].messagesItCanReceive.puki.config.hooks.beforeHandler.ordered.elements.value
//   }
//   {
//     const h = g.channels["channel-1"].messagesItCanSend.puki.parse({})
//   }
//   {

//   }
// }