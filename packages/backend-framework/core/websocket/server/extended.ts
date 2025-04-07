import { IPipeable } from './../../../../better-standard-library/src/errors-as-values/src/rust-like-pattern/pipe';
import { IMapable, ISimpleMapable } from "@custom-express/better-standard-library/src/errors-as-values/src/rust-like-pattern/mapable";
import { CustomWebSocketRouter } from "./core";
import { ChannelConfig } from '../types';

export class AsynApiDefined<
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
}
