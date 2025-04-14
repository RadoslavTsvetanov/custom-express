import { z, ZodObject, ZodRawShape, ZodRecord } from "zod";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";
import { OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import {MessageItCanReceive, MessageThatCanBeSent} from "../../../types/Message/main";
import { MessageThatCanBeReceivedBuilder } from "./MessageBuilder";
import {HookOrderedRecord, HookOrderedRecordEntry} from "../../../types/Hooks/main";

export class ChannelBuilder<
    MessagesItCanSend extends Record<string, ZodObject<ZodRawShape>>,
    MessagesItCanReceive extends Record<string, MessageItCanReceive<unknown, unknown>>,
    Elements extends HookOrderedRecordEntry[],
    Hooks extends HookOrderedRecord<Elements>
    > {

    public _hooks: Hooks;
    public _messagesItCanSend: MessagesItCanSend
    public _messagesItCanReceive: MessagesItCanReceive

    constructor(hooks: Hooks, messagesItCanSend: MessagesItCanSend, messagesItCanReceive: MessagesItCanReceive) {
        
    }

    createHooks(): HookBuilder<Hooks>{}

    createHookBuilder() {
        new HookBuilder<Hooks>()
    }
    
    hook(hook: OrderedRecord): ChannelBuilder<MessagesItCanSend,MessagesItCanReceive, {}>{}

    addSender<Name extends string, Schema extends ZodObject<ZodRawShape>>(
        config: {name: Name, schema: MessageThatCanBeSent<Schema>}
    ): Name extends MessagesItCanSend
        ? never
        : ChannelBuilder<
            MessagesItCanSend & Record<Name, typeof config>,
            MessagesItCanReceive ,
            Elements,
            Hooks
        > {
        return new ChannelBuilder(
            this._hooks,
            { ...this._messagesItCanSend, [config.name]: config.schema },
            this._messagesItCanReceive
        )
    }


    addReceiver<
        Name extends string,
        Schema extends ZodObject<ZodRawShape>
        >(
            config: { name: Name } & MessageItCanReceive<unknown, Schema>
        
    ): ChannelBuilder<

        MessagesItCanSend,
        (
            MessagesItCanReceive
                &
            Record<Name, Omit<typeof config, "name">>
        ),
        Elements,
        Hooks
        > {
        return new ChannelBuilder(
            this._hooks,
            this._messagesItCanSend,
            { ...this._messagesItCanReceive, [config.name]: { ...config } }
        )
    }
}



{
const exampleChannel = new ChannelBuilder(
    new HookBuilder([])
        .add({ key: "kokiiiio", execute: v => { return "" } })
        .add({ key: "p", execute: v => { } }).build(),
    {
        jiji: z.object({
            hi: z.string()
        }),
        lplp: z.object({
            h9i: z.object({
                koko: z.string()
            })
        })
    },
    {
        kokoko: new MessageThatCanBeReceivedBuilder(
            HookBuilder
                .new()
                .add({ key: "koko", execute: v => "" })
                .build(),
                v => {
                // v should be of type string
                }
            )
            .build() 
    } as const
)
.addReceiver({
        name: "h" as const,
        config: {
            hooks: HookBuilder
                .new()
                .add({ key: "jido", execute: v => 3 })
                .add({ key: "jiido", execute: v => { return { jibri: "", chili: "" } as const } } as const)
                .add({key: "keko", execute: v => {}} as const)
                .build(),
            handler: v => {},
        },
        parse: z.object({
            s: z.string()
        })
} as const)
    .addReceiver({
        name: "jiko",
        config: {
            hooks: HookBuilder
                .new()
                .add({ key: "lolo", execute: v => { } }),
                handler: v => ""
        },
        parse: z.object({
            hi: z.string()
        })
} as const)
.addSender({
    name: "kook",
    schema: z.object({

    })
})


exampleChannel.createHookBuilder() // provides infered
    {
        const {jiji, lplp} = exampleChannel._messagesItCanSend
        
        // should have keys jiji, lplp
    }


    {

        const g = exampleChannel._messagesItCanReceive
        g.h 
        g.kokoko
        // both should be defined

    }

    {
        const g = exampleChannel._messagesItCanSend
        g.jiji
        g.kook
        g.lplp
        // both should be defined and the value should be the respective zod schema 
    }

}

{
    // Initial hooks
    const initialHooks = HookBuilder.new()
        .add({ key: "kokiiiio", execute: v => "" })
        .add({ key: "p", execute: v => { } })
        .build();

    // Initial messages it can send
    const initialSenders = {
        jiji: z.object({
            hi: z.string()
        }),
        lplp: z.object({
            h9i: z.object({
                koko: z.string()
            })
        })
    };

    // Initial receivers
    const initialReceivers = {
        kokoko: MessageThatCanBeReceivedBuilder.new(
            HookBuilder
                .new()
                .add({ key: "koko", execute: v => "" })
                .build(),
            z.object({
                jo: z.string()
            }), 
            v => {
                // v should be of type string
            }
        )    .build()
    } as const;

    initialReceivers.kokoko.parse

    // Create the initial channel
    const baseChannel = new ChannelBuilder(
        initialHooks,
        initialSenders,
        initialReceivers
    );

    // Add additional receivers
    const channelWithReceivers = baseChannel
        .addReceiver({
            name: "h" as const,
            config: {
                hooks: HookBuilder.new()
                    .add({ key: "jido", execute: v => 3 })
                    .add({
                        key: "jiido",
                        execute: v => ({ jibri: "", chili: "" } as const)
                    })
                    .add({ key: "keko", execute: v => { } })
                    .build(),
                handler: v => { }
            },
            parse: z.object({
                s: z.string()
            })
        } as const)
        .addReceiver({
            name: "jiko",
            config: {
                hooks: HookBuilder.new()
                    .add({ key: "lolo", execute: v => { } })
                    .build(),
                handler: v => ""
            },
            parse: z.object({
                hi: z.string()
            })
        });

    // Add a sender
    const completeChannel = channelWithReceivers.addSender({
        name: "kook",
        schema: z.object({})
    });

    // --- Introspection Blocks ---

    // Block: Messages it can send
    {
        const { jiji, lplp, kook } = completeChannel._messagesItCanSend;
        // jiji, lplp, and kook are all zod schemas
    }

    // Block: Messages it can receive
    {
        const { kokoko, h, jiko } = completeChannel._messagesItCanReceive;
        // All three receivers are available
    }
}