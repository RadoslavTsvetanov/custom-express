import { Last, OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { MessageHandler, MessageThatCanBeSent } from "../../../types/Message/main";

export class MessageThatCanBeReceivedBuilder<
    Context,
    BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    MsgHandler extends MessageHandler<ReturnType<Last<BeforeHooks["elements"]["value"]>["execute"]>,unknown,BeforeHooks>
>{
    public _message: MsgHandler
    public _hooks: BeforeHooks
    public __l:  Last<BeforeHooks["elements"]["value"]>  
    constructor(hooks: BeforeHooks, handler: MsgHandler["handler"]) {
        
    }


    addHooks<Hooks extends HookOrderedRecord<HookOrderedRecordEntry[]>>(){}
    createHookBuilder(): HookBuilder<BeforeHooks["elements"]["value"]>{ // this is so that we cant pass a hook with a name that already exists 
        return new HookBuilder()
    }


    build(): MessageHandler<> {
        
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


