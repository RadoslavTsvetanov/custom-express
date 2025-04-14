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
        .add({ key: "koko", execute: v => { return "" } })
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
        koko: new MessageThatCanBeReceivedBuilder(
            HookBuilder
                .new()
                .add({ key: "koko", execute: v => "" })
                .build(),
                v => {
                // v should be of type string
                }
            )
            .build()
    }
)
.addReceiver({
        name: "h" as const,
        config: {
            hooks: HookBuilder
                .new()
                .add({ key: "jido", execute: v => { } })
                .build(),
            handler: v => {},
        },
        parse: z.object({
            s: z.string()
        })
    } as const)
.addSender({
    name: "kook",
    schema: z.object({

    })
})
    {
        const {jiji, lplp} = exampleChannel._messagesItCanSend
        
        // should have keys jiji, lplp
    }


    {

        const g = exampleChannel._messagesItCanReceive
        g.h 
        g.koko
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

