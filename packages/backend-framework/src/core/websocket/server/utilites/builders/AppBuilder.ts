import { Extended } from "../../app/extended";

export class BuilderEnhanced<
    ChannelNames extends string,
    Channels extends Record<
        ChannelNames,
        ChannelConfig<infer T>
    >,
    Context extends Record<ContextKeys, unknown>,
    ContextKeys extends string,
    BeforeHooks extends OrderedRecord<>,
    LastHookReturnType extends Record<string, unknown> = {
        headers: { [x: string]: Optionable<string> };
    },
    LastHook extends (v: unknown) => LastHookReturnType = (v: {
        headers: { [x: string]: Optionable<string> };
    }) => LastHookReturnType,
    BaseRequest = {}
> extends Extended<

    ChannelNames,
    Channels , 
    Context  ,
    ContextKeys ,
    BeforeHooks,
    LastHookReturnType 
,
LastHook ,
    BaseRequest 
>{
  constructor() {
    super()
  }
  createHookBuilder(type: "before"): HookBuilder<>{ // so that we can pass the approppriate existing context inestead iod you needing to pass it on your own
    return new HookBuilder(this.hooks[type])
  }

  createChannelBuilder<NewChannelName extends string>(channelName: NewChannelName): NewChannelName extends ChannelNames ? never : ChannelBuilder<>{} // the same logic behind it as HookBuilder

function hook<
  HookType extends "beforeHandle",
  NewHooks extends HookOrderedRecord<[{ key: string; execute: (ctx: string /* get the return type of the last hook */) => unknown }, ...any[]]>
>(
  hooks: NewHooks
): FirstArg<NewHooks["elements"]["value"][0]["execute"]> {

}

}