import { IPipeable } from './../../../../better-standard-library/src/errors-as-values/src/rust-like-pattern/pipe';
import { IMapable, ISimpleMapable } from "@custom-express/better-standard-library/src/errors-as-values/src/rust-like-pattern/mapable";
import { CustomWebSocketRouter } from "./core";
import { ChannelConfig } from '../types';
import { z, ZodObject, ZodRawShape } from 'zod';
import { map, TrueMap } from '@custom-express/better-standard-library';

export class EXtended<
  ChannelNames extends string,
  Channels extends Record<
    ChannelNames,
    ChannelConfig<>
    >,
  Context extends Record<ContextKeys, unknown>,
  ContextKeys extends string
> extends CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys> implements
    ISimpleMapable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >,
    IPipeable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >,
    IMapable<
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>,
      CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
    >{
  constructor(channels: Channels, context?: Context) {
    super(channels, context);
    // You can now do custom things with `this.channels` or `this.context`
  }

  // Example of an additional method

  get definition(): AsyncAPIDocument {
    return this.channels;
  }



  guard<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
    return map(config,({ name, type, schema }) => 

      this.hook({
        name,
        type,
        handler: (ctx) => {
          const passthroughSchema = schema.passthrough();
          const result = passthroughSchema.safeParse(ctx);

          if (!result.success) {
            throw result.error;
          }

          return ctx as z.infer<typeof schema>;

        }
      }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
    )
  }


  
  match<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
    return map(config,({ name, type, schema }) => 

      this.hook({
        name,
        type,
        handler: (ctx) => {
          const passthroughSchema = schema.strict();
          const result = passthroughSchema.safeParse(ctx);

          if (!result.success) {
            throw result.error;
          }

          return ctx as z.infer<typeof schema>;

        }
      }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
    )
  }

}
