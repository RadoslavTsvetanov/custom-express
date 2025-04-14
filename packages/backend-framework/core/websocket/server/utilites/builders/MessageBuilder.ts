import { IfNotUndefined, Last, Optionable, OrderedRecord } from "@custom-express/better-standard-library";
import { HookBuilder } from "./HookBuilder";
import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { MessageHandler, MessageItCanReceive, MessageThatCanBeSent } from "../../../types/Message/main";
import { z, ZodObject, ZodRawShape, ZodUnknown } from "zod";

export class MessageThatCanBeReceivedBuilder<
    BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    MsgHandler extends MessageHandler<ReturnType<Last<BeforeHooks["elements"]["value"]>["execute"]>,unknown,BeforeHooks>
>{
    public _message: MsgHandler
    public _hooks: BeforeHooks
    public parser: Optionable<ZodObject<ZodRawShape>>


    // the `new` mthod is prefered since it correctly get the parse type without needing to explicitely pass as const 

    constructor(hooks: BeforeHooks, parser: ZodObject<ZodRawShape> | undefined, handler: /*TODO: make this work so that the code is cleaner IfNotUndefined<z.infer<typeof parser>,MsgHandler["handler"]> */typeof parser extends undefined ? MsgHandler["handler"] : (v: z.infer<typeof parser>) => unknown ) {
        this.parser = new Optionable(parser)
        this._hooks = hooks;
        // this._message = {
        //     handler,
        //     hooks: 
        // }
    }


    gg({ name = "", jiji }: {name: string, jiji:string }) {
        
    }

    static new<
        Parser extends ZodObject<ZodRawShape>,
        BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,    
        MsgHandler extends MessageHandler<ReturnType<Last<BeforeHooks["elements"]["value"]>["execute"]>,unknown,BeforeHooks>
        >(
            hooks: BeforeHooks,
            parser: Parser | undefined,
            handler: /*TODO: make this work so that the code is cleaner IfNotUndefined<z.infer<typeof parser>,MsgHandler["handler"]> */typeof parser extends undefined ? MsgHandler["handler"] : (v: z.infer<typeof parser>) => unknown): MessageThatCanBeReceivedBuilder<{}, BeforeHooks, MsgHandler>{
            return new MessageThatCanBeReceivedBuilder(hooks, parser, handler)
        }


    addHooks<Hooks extends HookOrderedRecord<HookOrderedRecordEntry[]>>(){}
    createHookBuilder(): HookBuilder<BeforeHooks["elements"]["value"]>{ // this is so that we cant pass a hook with a name that already exists 
        return new HookBuilder()
    }


    build(): MessageItCanReceive<BeforeHooks, typeof this.parser.optionValue> {
        return {
            config: {
                handler: this._message.handler,
                hooks: this._hooks
            },
            parse: this.parser.unpack()
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
    undefined,
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


