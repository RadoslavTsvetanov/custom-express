import { z, ZodObject, ZodRawShape, ZodRecord } from "zod";
import { HookOrderedRecord, HookOrderedRecordEntry, MessageItCanReceive, MessageITCanReceive, MessageThatCanBeSent } from "../../../types";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";
import { OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";

export class ChannelBuilder<
    MessagesItCanSend extends Record<string, ZodObject<ZodRawShape>>,
    MessagesItCanReceive extends Record<string, unknown>,
    Elements extends HookOrderedRecordEntry[],
    Hooks extends HookOrderedRecord<Elements>
    > {

    public hooks: Hooks;
    public messagesItCanSend: MessagesItCanSend 
    public messagesItCanReceive: MessagesItCanReceive 

    constructor(hooks: Hooks, messagesItCanSend: MessagesItCanSend, messagesItCanReceive: MessagesItCanReceive) {
        
    }

    createHooks(): HookBuilder<Hooks>{}

    hook(hook: OrderedRecord): ChannelBuilder<MessagesItCanSend,MessagesItCanReceive, {}>{}

    addMessageThatCanBeSent<Name extends string, Schema extends ZodObject<ZodRawShape>>(
        config: {name: Name, schema: MessageThatCanBeSent<Schema>}
    ): Name extends MessagesItCanSend ? never : ChannelBuilder<MessagesItCanSend | Name, MessagesItCanSend> {
        return new ChannelBuilder(this.hooks, { ...this.messagesItCanSend, [config.name]: config.schema }, this.messagesItCanReceive)
    }


    addMessageThatCanBeReceived<Name extends string, Schema extends ZodObject<ZodRawShape>>(config: {name: Name} & MessageItCanReceive<unknown, unknown>) {
        return new ChannelBuilder(this.hooks, this.messagesItCanSend, {...this.messagesItCanReceive, [config.name]: {...config}})
    }
}




const exampleChannel = new ChannelBuilder(
    new HookBuilder([]).add({ key: "koko", execute: v => { return ""} }).add({key: "p", execute: v => {}})._elements,
    {
        jiji: z.object({
            hi: z.string()
        })
    },
    {
        koko: {}
    }
)