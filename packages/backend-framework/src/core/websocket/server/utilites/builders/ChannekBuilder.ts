import { z, ZodObject, ZodRawShape, ZodRecord } from "zod";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";
import { OrderedRecord, TrueMap } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { MessageItCanReceive, MessageThatCanBeSent, TypedMessage } from "../../../types/Message/main";
import { MessageThatCanBeReceivedBuilder } from "./MessageBuilder";
import { Hook, HookOrderedRecord, HookOrderedRecordBase, HookOrderedRecordEntry, ServerHooks } from "../../../types/Hooks/main";
import { ChannelConfig } from "../../../types/Channel/main";

export class ChannelBuilder<
    MessagesItCanSend extends Record<string, ZodObject<ZodRawShape>>,
    MessagesItCanReceive extends Record<
        string,
        MessageItCanReceive<HookOrderedRecord<HookOrderedRecordEntry[]>, ZodObject<ZodRawShape>>
    >,
    Hooks extends ServerHooks<
        Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
        Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>
    >
> {

    public _hooks: Hooks;
    public _messagesItCanSend: MessagesItCanSend
    public _messagesItCanReceive: MessagesItCanReceive

    public getMessagesItCanSend: {
        [Message in keyof MessagesItCanSend]: z.infer<MessagesItCanSend[Message]>
    }

    constructor(hooks: Hooks, messagesItCanSend: MessagesItCanSend, messagesItCanReceive: MessagesItCanReceive) {

    }

    createHookBuilder<Type extends "afterHandle" /* replace with the actual types */>(t: Type): HookBuilder<Hooks[Type]["ordered"]> {
        return
    }

    hook(hook: OrderedRecord): ChannelBuilder<MessagesItCanSend, MessagesItCanReceive, {}> { }

    addSender<Name extends string, Schema extends ZodObject<ZodRawShape>>(
        config: { name: Name, schema: MessageThatCanBeSent<Schema> }
    ): Name extends MessagesItCanSend
        ? never
        : ChannelBuilder<
            MessagesItCanSend & Record<Name, Schema>,
            MessagesItCanReceive,
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
        Schema extends ZodObject<ZodRawShape>,
        Other extends MessageItCanReceive<HookOrderedRecordBase, Schema>
    >
        (
            config: { name: Name } & Other
        ): Name extends keyof MessagesItCanReceive

        ? never 
        : ChannelBuilder<

            MessagesItCanSend,
            (
                MessagesItCanReceive
                &
                Record<Name, Omit<typeof config, "name">>
            ),
            Hooks
        >{
        return new ChannelBuilder(
            this._hooks,
            this._messagesItCanSend,
            { ...this._messagesItCanReceive, [config.name]: { ...config } }
        )
    }


    build(): ChannelConfig<
        MessagesItCanSend,
        MessagesItCanReceive,
        Hooks
    > {
        return 
    }
}



{
    const exampleChannel = new ChannelBuilder(
        {
            beforeHandle: {
                ordered: HookBuilder
                .new()
                    .add({ key: "koko", execute: v => { return "" } })
                    .add({ key: "p", execute: v => { } })
                    .build(),
                independent: [],
            },
            afterHandle: {
                ordered: HookBuilder 
                    .new()
                    .add({key: "", execute: v => {}})
                    .build(),
                independent: []
            },
            onError: v => {2},
        },
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
        // end of constructor
        .addReceiver({
            name: "h" as const,
            config: {
                hooks: {
                    "afterHandler": {
                        ordered: HookBuilder.new().add({key: "", execute: v => {}}).build(),
                        independent: []
                    },
                    "beforeHandler": {
                        ordered: HookBuilder.new().add({key: "", execute: v => {}}).build(),
                        independent: []
                    },
                    "onErrorr": v => {}
                },
                handler: v => { },
            },
            parse: z.object({
                s: z.string()
            })
        } as const)
        .addSender({
            name: "kook",
            schema: z.object({
                jiji: z.string()
            })
        })
    {
        const { jiji, lplp } = exampleChannel._messagesItCanSend

        // should have keys jiji, lplp
    }


    {

        const g = exampleChannel._messagesItCanReceive
        g.h
        g.koko
        // both should be defined

    }

    {
        const g = exampleChannel.getMessagesItCanSend
        g.jiji
        g.kook
        g.lplp
        // both should be defined and the value should be the respective zod schema 
    }

}
