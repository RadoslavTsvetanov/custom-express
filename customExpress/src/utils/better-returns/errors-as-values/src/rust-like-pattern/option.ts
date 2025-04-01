import type { VCallback } from "../../../../../types/voidcallback";
import { logger } from "../utils/console";
import { type ILeftRight, LeftRight } from "./leftRight";
import type { Tick } from "./tick";
import { CustomUnpackable,type IUnpackable } from "./unpackable/unpackable";

export type none = null | undefined;

export interface IOptionable<T> extends IUnpackable<T> {
  is_none: () => boolean;
}

// export class Optionable<T> implements IOptionable<T>{
//     private value: T | none = null
//     constructor(v: T | none) {
//        this.value = v
//     }

//     unpack(): T {
//         if (this.value === null || this.value === undefined) {
//             throw new Error("Option is None")
//         }
//         return this.value
//     }

//     unpack_with_default(d: T): T{
//         if (this.value === null || this.value === undefined) {
//            return d
//         }
//         return this.value
//     }
//     is_none(): boolean{
//         return this.value === undefined || this.value === null
//     }

//     unpack_or_with_diverging_type_from_the_original<C>(customHandler: () => C) : ILeftRight<Optionable<T>,Optionable<C>>{
//         if (this.value === null) {
//             return new LeftRight(new Optionable<T>(null),new Optionable(customHandler()))
//         }
//         return new LeftRight(new Optionable(this.value),new Optionable<C>(null))
//    }

//     unpack_or(default_handler: () => T): T{
//         if (this.value === null || this.value === undefined) {
//             return default_handler()
//         }
//         return this.value
//    }
// }

//Plan -> write tests for this and then remake it to inherit since currently it will easier to test it whether it behaves cirrectly and if not debugging will be easier


export const statics = {
  messageForWhenOptionIsNone: "Option is None "
}


export class Optionable<T> extends CustomUnpackable<T> implements Tick<CustomUnpackable<T>>{
  constructor(v: T | none) {
    super(v as T, (v) => {
      return !this.is_none() //! chatbots will say this does not work ignore it, it works as expected
    });
    this.messageWhenYouCntUnpack = statics.messageForWhenOptionIsNone 
  }

  is_none(): boolean {
    return this.value === null || this.value === undefined;
  }

  tick(callback: VCallback<CustomUnpackable<T>>){
    callback(this)
    return this
  }
  try(options: {
    ifNotNone: (v: T) => void
    ifNone: () => void
  }): void {
    if (this.is_none()) {
      options.ifNone();
    } else {
      options.ifNotNone(this.value)
    }
  }

}


export function ifNotNone<T>(v: T | none, callback: (v: T) => void) {
  return new Optionable(v as T).ifCanBeUnpacked(callback)
}