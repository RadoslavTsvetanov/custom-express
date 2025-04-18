import { First, ifNotNone, Last, OrderedRecord, FirstArg } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { BaseHookBundle, BaseMessageHooks, HookOrderedRecord, HookOrderedRecordEntry, HookTypes, MessageHooks } from "../../../types/Hooks/main";
import { MessageHandler, MessageItCanReceive, MessageThatCanBeSent } from "../../../types/Message/main";
import { z, ZodObject, ZodRawShape } from "zod";
import { ChannelBuilder } from "./ChannekBuilder";



//TODO: refactor since there is a lot of redundant things here
export class MessageThatCanBeReceivedBuilder<
    Hooks extends BaseMessageHooks,
    MsgHandler extends MessageHandler<
        unknown,
        Hooks
    >
>{
    public _message: MsgHandler
    public _hooks: Hooks
    constructor(hooks: Hooks, handler: (v: ReturnType<Last<Hooks["beforeHandler"]["ordered"]["elements"]["value"]>["execute"]>) => unknown) {
        this._hooks = hooks
        this._message = {
            "hooks": this._hooks,
            "handler": handler
        }
    }


    static new<
        Parser extends ZodObject<ZodRawShape>,
        Hooks extends  MessageHooks<
        BaseHookBundle,
        BaseHookBundle
    >,    
        MsgHandler extends MessageHandler<
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
        ReturnType<Last<Hooks[typeof type]["ordered"]["elements"]["value"]>["execute"]> extends FirstArg<First<NewHooks["elements"]["value"]>["execute"]>
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


    build(): MessageItCanReceive<Hooks, ReturnType<MsgHandler["handler"]>> {
        return {
            config:{"hooks":this._hooks,"handler": this._message.handler}, 
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