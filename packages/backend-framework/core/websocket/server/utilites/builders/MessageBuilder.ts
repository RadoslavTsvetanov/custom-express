import { ifNotNone, Last, OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { MessageHandler, MessageItCanReceive, MessageThatCanBeSent } from "../../../types/Message/main";
import { z, ZodObject, ZodRawShape } from "zod";

export class MessageThatCanBeReceivedBuilder<
    BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    MsgHandler extends MessageHandler<ReturnType<Last<BeforeHooks["elements"]["value"]>["execute"]>,unknown,BeforeHooks>
>{
    public _message: MsgHandler
    public _hooks: BeforeHooks
    public __l:  Last<BeforeHooks["elements"]["value"]>
    constructor(hooks: BeforeHooks ,handler: MsgHandler["handler"]) {
        
    }


    static new<
        Parser extends ZodObject<ZodRawShape>,
        BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,    
        MsgHandler extends MessageHandler<
                ReturnType<Last<BeforeHooks["elements"]["value"]>["execute"]>,
                unknown,
                BeforeHooks
            >
        >(
            hooks: BeforeHooks,
            parser: Parser | undefined, // if not undefined parser will just be a guard hook that is added to the hooks 
            handler: typeof parser extends z.ZodType<infer U> ? (v: U) => unknown : MsgHandler["handler"]) {
                const newHooks = parser == undefined ? hooks : new HookBuilder(hooks.elements.value).build()
                return new MessageThatCanBeReceivedBuilder(newHooks,handler)
        }

    addHooks<Hooks extends HookOrderedRecord<HookOrderedRecordEntry[]>>(){}
    createHookBuilder(): HookBuilder<BeforeHooks["elements"]["value"]>{ // this is so that we cant pass a hook with a name that already exists 
        return new HookBuilder()
    }


    build(): MessageItCanReceive<BeforeHooks,ZodObject<ZodRawShape>> {
        return {
            config:{"hooks":this._hooks, "handler": this._message.handler}, 
            "parse": z.object({}),
        }
    }

}


const hooks = HookBuilder
    .new() // using new is the reccomended way since it is a cleaner although 
    .add({ key: "ok", execute: v => "" } as const)
    .add({ key: "hohoh", execute: v => { return {"hi": ""} as const } } as const)
    .build()

{
    
}

{
const newMsg = new MessageThatCanBeReceivedBuilder(
    hooks,
    v => {
        v // shoud be of type  
//  {
//     readonly hi: "";
//  }
        return {
            ...v,
            koko: ""
        }
    }
)
}


