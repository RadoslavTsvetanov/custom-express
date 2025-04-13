import { OrderedRecord } from "@custom-express/better-standard-library";
import { Handler, HookOrderedRecord, HookOrderedRecordEntry, MessageHandler, MessageItCanReceive } from "../../../types";
import { HookBuilder } from "./HookBuilder";

export class MessageThatCanBeReceivedBuilder<
    Context,
    BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    MsgHandler extends MessageHandler<BeforeHooks["lastElement"],unknown,BeforeHooks>
>{
    public _message: MsgHandler
    public _hooks: BeforeHooks
    public h :BeforeHooks["lastElement"]
    public l: MsgHandler["handler"]
    constructor(name: string, hooks: BeforeHooks, handler: ReturnType<MsgHandler["handler"]>) {
        
    }


    addHook()

    createHookBuilder()
}


const hooks = new HookBuilder().add({ key: "ok", execute: v => "" }).add({ key: "hohoh", execute: v => { return {} } })._elements


const newMsg = new MessageThatCanBeReceivedBuilder(
    "hi",

    new HookBuilder().add({ key: "ok", execute: v => "" }).add({ key: "hohoh", execute: v => { return {} } })._elements,
    v => {}
)



