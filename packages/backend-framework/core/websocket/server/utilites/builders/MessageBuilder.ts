import { First, Last } from "@custom-express/better-standard-library";
import { BaseHookBundle, HookOrderedRecord, HookOrderedRecordEntry, MessageHooks } from "../../../../../src/core/websocket/types/Hooks/main";
import { MessageHandler, MessageItCanReceive } from "../../../../../src/core/websocket/types/Message/main";
import { z, ZodObject, ZodRawShape } from "zod";
import { HookBuilder } from "../../../../../src/core/websocket/server/utilites/builders/HookBuilder";




type FirstArgument<T extends (...args: any[]) => any> =
  T extends (arg1: infer A, ...args: any[]) => any ? A : never;



export class MessageThatCanBeReceivedBuilder<
    Hooks extends MessageHooks<
        BaseHookBundle,
        BaseHookBundle
    >,
    MsgHandler extends MessageHandler<
        ReturnType<Last<Hooks["beforeHandler"]["ordered"]["elements"]["value"]>["execute"]>,
        unknown,
        Hooks
    >
>{
    public _message: MsgHandler
    public _hooks: Hooks
    constructor(hooks: Hooks, handler: MsgHandler["handler"]) {
        
    }


    static new<
        Parser extends ZodObject<ZodRawShape>,
        Hooks extends  MessageHooks<
        BaseHookBundle,
        BaseHookBundle
    >,    
        MsgHandler extends MessageHandler<
                ReturnType<Last<Hooks["beforeHandler"]["ordered"]["elements"]["value"]>["execute"]>,
                unknown,
                Hooks
            >
        >(
            hooks: Hooks,
            parser: Parser | undefined, // if not undefined parser will just be a guard hook that is added to the hooks 
            handler: typeof parser extends z.ZodType<infer U> ? (v: U) => unknown : MsgHandler["handler"]) {
                const newHooks = parser == undefined ? hooks : new HookBuilder(hooks.elements.value).build()
                return new MessageThatCanBeReceivedBuilder(newHooks,handler)
        }

    addHooks<NewHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>>(type: "beforeHandler"):
        ReturnType<Last<Hooks[typeof type]["ordered"]["elements"]["value"]>["execute"]> extends FirstArgument<First<NewHooks["elements"]["value"]>["execute"]>
        ? MessageThatCanBeReceivedBuilder<
            HookOrderedRecord<[
                ...Hooks["elements"]["value"],
                ...NewHooks["elements"]["value"]
            ]>,
            MsgHandler
        > 
        : never
    {
        return 
        }
    createHookBuilder(type: "beforeHandler" /* HookTypes["MessageOnlyHooks"] TODO: fix this sinceit fails cuz onError is not hook type but regualr callback*/): HookBuilder<Hooks[typeof type]["ordered"]["elements"]["value"]>{ // this is so that we cant pass a hook with a name that already exists 
        return new HookBuilder<Hooks[typeof type]["ordered"]["elements"]["value"]>(this._hooks[type].ordered.elements.value)
    }


    build(): MessageItCanReceive<Hooks,ZodObject<ZodRawShape>> {
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
    {
        "beforeHandler": {
            ordered: hooks,
            independent: []
        },
        "afterHandler": {
            ordered: hooks,
            independent: []
        },
        "onErrorr": v => "" as const 
    },
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


