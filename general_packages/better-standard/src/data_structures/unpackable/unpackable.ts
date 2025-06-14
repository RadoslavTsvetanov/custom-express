import type { ILeftRight } from "../leftRight";
import type { none } from "../option";

import { panic } from "../../../panic";
import { LeftRight } from "../leftRight";
import { Mapable } from "../mapable";

export type IUnpackable<T> = {
    unpack: (errMsg?: string) => Mapable<T, unknown>;
    unpack_or_with_diverging_type_from_the_original: <C>(
        d: () => C
    ) => ILeftRight<T, C>;
    unpack_or: (d: () => T) => T;
    unpack_with_default: (d: T) => T;
    expect: (msg: string) => T;
    ifCanBeUnpacked: (handler: (v: T) => void) => void;
};

export class CustomUnpackable<T> implements IUnpackable<T> {
    protected value: T;
    protected canBeUnpacked: () => boolean;
    private cantUnpackMessage: string = "cant unpack";
    public set messageWhenYouCntUnpack(msg: string) {
        this.cantUnpackMessage = msg;
    }

    constructor(v: T, isValueValid: (v: T) => boolean) {
        this.value = v;
        this.canBeUnpacked = () => isValueValid(this.value);
    }

    // unpack_with_result_instead_of_throwing(): ConcreteResult<T> {
    //   if (!this.couldUnpack()) {
    //     return new ConcreteResult<T>(new Optionable<T>(null),new Optionable(new CustomError("couldnt unpack value is"+ this.value )))
    //   }
    //   return new ConcreteResult<T>(new Optionable(this.value), new Optionable<CustomError>(null))
    // }
    ifCanBeUnpacked(handler: (v: T) => void): void {
        if (this.canBeUnpacked()) {
            handler(this.value);
        }
    }

    expect(msg: string): T {
        if (!this.canBeUnpacked()) {
            throw new Error(msg);
        }
        return this.value;
    }

    get raw(): T | none {
        return this.value;
    }

    unpack(errorMsg?: string): Mapable<T, unknown> {
        if (!this.canBeUnpacked()) {
            if (errorMsg) {
                panic(errorMsg);
            }

            throw new Error(this.cantUnpackMessage);
        }
        return new Mapable(this.value);
    }

    unpack_or(default_handler: () => T): T {
        if (!this.canBeUnpacked()) {
            return default_handler();
        }
        return this.value;
    }

    unpack_with_default(d: T): T {
        if (!this.canBeUnpacked()) {
            return d;
        }
        return this.value;
    }

    unpack_or_with_diverging_type_from_the_original<C>(
        d: () => C,
    ): ILeftRight<T, C> {
        if (!this.canBeUnpacked()) {
            return new LeftRight(<T>null, d());
        }

        return new LeftRight(this.value, <C>null);
    }
}
