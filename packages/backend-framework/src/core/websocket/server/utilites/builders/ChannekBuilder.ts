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
        MessageItCanReceive<HookOrderedRecord<
            HookOrderedRecordEntry[]>,
            ZodObject<ZodRawShape>
        >
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