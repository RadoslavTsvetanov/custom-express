import { OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { MessageHandler } from "../../../types/Message/main";

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



