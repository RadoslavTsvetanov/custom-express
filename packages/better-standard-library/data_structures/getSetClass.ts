import type { VCallback } from "../types/voidcallback";
import {
  Mapable,
  type IMapable,
} from "../../../websocket panel/src/utils/better-returns/errors-as-values/src/rust-like-pattern/mapable";
import {
  ifNotNone,
  Optionable,
} from "../../../websocket panel/src/utils/better-returns/errors-as-values/src/rust-like-pattern/option";

export class GetSet<V> implements IMapable<V> {
  private v: V;

  private onSet: VCallback<V> = (v: V) => {};
  private onGet: VCallback<V> = (v: V) => {};

  constructor(v: V, onGet?: VCallback<V>, onSet?: VCallback<V>) {
    this.v = v;
    ifNotNone(onGet, (onGet) => (this.onGet = onGet));
    ifNotNone(onSet, (onSet) => (this.onSet = onSet));
  }

  // public map(func: (v: V) => V): V  {
  //     this.onGet.v(this.v)
  //     return new Mapable(this.v);
  // }

  map<ReturnType>(func: (v: V) => ReturnType): ReturnType {
    return func(this.value);
  }

  get value(): V {
    // this.onGet(this.v)
    return this.v;
  }

  setV(v: V) {
    this.onSet(v);
    this.v = v;
  }
}

export class Get<V> {
  private readonly value: V;
  constructor(v: V) {
    this.value = v;
  }
  public get v() {
    return this.value;
  }
}

export type inferType<T extends GetSet<unknown>> = T["value"];
