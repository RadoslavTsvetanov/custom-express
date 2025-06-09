// import { IPipeable } from '@blazyts/better-standard-library/src/errors-as-values/src/rust-like-pattern/pipe';
// import { IMapable, ISimpleMapable } from "@blazyts/better-standard-library/src/errors-as-values/src/rust-like-pattern/mapable";
// import { CustomWebSocketRouter } from "./index";
// import { z, ZodObject, ZodRawShape } from 'zod';
// import { First, map, Optionable, OrderedRecord, TrueMap } from '@blazyts/better-standard-library';
// import { HookBuilder } from '../utilites/builders/HookBuilder';
// import { ChannelBuilder } from '../utilites/builders/ChannekBuilder';
// import { ChannelConfig } from '../../types/Channel/main';

// export class Extended<
//   ChannelNames extends string,
//   Channels extends Record<
//     ChannelNames,
//     ChannelConfig<infer T>
//   >,
//   Context extends Record<ContextKeys, unknown>,
//   ContextKeys extends string,
//   Hooks extends ServerHooks,
//   LastHookReturnType extends Record<string, unknown> = {
//     headers: { [x: string]: Optionable<string> };
//   },
//   LastHook extends (v: unknown) => LastHookReturnType = (v: {
//     headers: { [x: string]: Optionable<string> };
//   }) => LastHookReturnType,
//   BaseRequest = {}
// > extends CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> implements
//     ISimpleMapable<
//       CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
//     >,
//     IPipeable<
//       CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
//     >,
//     IMapable<
//       CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>,
//       CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
//     >{
//   constructor(channels: Channels, context?: Context) {
//     super(channels, context);
//     // You can now do custom things with `this.channels` or `this.context`
//   }

//   // Example of an additional method

//   get definition(): AsyncAPIDocument {
//     return this.channels;
//   }

//   guard<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
//     return map(config,({ name, type, schema }) =>

//       this.hook({
//         name,
//         type,
//         handler: (ctx) => {
//           const passthroughSchema = schema.passthrough();
//           const result = passthroughSchema.safeParse(ctx);

//           if (!result.success) {
//             throw result.error;
//           }

//           return ctx as z.infer<typeof schema>;

//         }
//       }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
//     )
//   }

//   match<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
//     return map(config,({ name, type, schema }) =>

//       this.hook({
//         name,
//         type,
//         handler: (ctx) => {
//           const passthroughSchema = schema.strict();
//           const result = passthroughSchema.safeParse(ctx);

//           if (!result.success) {
//             throw result.error;
//           }

//           return ctx as z.infer<typeof schema>;

//         }
//       }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
//     )
//   }

// }

// export class BuilderEnhanced<
//     ChannelNames extends string,
//     Channels extends Record<
//         ChannelNames,
//         ChannelConfig<infer T>
//     >,
//     Context extends Record<ContextKeys, unknown>,
//     ContextKeys extends string,
//     BeforeHooks extends OrderedRecord<>,
//     LastHookReturnType extends Record<string, unknown> = {
//         headers: { [x: string]: Optionable<string> };
//     },
//     LastHook extends (v: unknown) => LastHookReturnType = (v: {
//         headers: { [x: string]: Optionable<string> };
//     }) => LastHookReturnType,
//     BaseRequest = {}
// > extends Extended<

//     ChannelNames,
//     Channels ,
//     Context  ,
//     ContextKeys ,
//     BeforeHooks,
//     LastHookReturnType
// ,
// LastHook ,
//     BaseRequest
// >{
//   constructor() {
//     super()
//   }
//   createHookBuilder(type: "before"): HookBuilder<>{ // so that we can pass the approppriate existing context inestead iod you needing to pass it on your own
//     return new HookBuilder(this.hooks[type])
//   }

//   createChannelBuilder<NewChannelName extends string>(channelName: NewChannelName): NewChannelName extends ChannelNames ? never : ChannelBuilder<>{} // the same logic behind it as HookBuilder

// function hook<
//   HookType extends "beforeHandle",
//   NewHooks extends HookOrderedRecord<[{ key: string; execute: (ctx: string /* get the return type of the last hook */) => unknown }, ...any[]]>
// >(
//   hooks: NewHooks
// ): FirstArg<NewHooks["elements"]["value"][0]["execute"]> {

// }

// }
