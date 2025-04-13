import { Last, OrderedRecord } from "@custom-express/better-standard-library";
import {
  Handler,
  HookOrderedRecord,
  HookOrderedRecordEntry,
} from "../../../types";


type WithDefault<Default, Type> = [Type] extends [never] ? Default : Type;

type g = WithDefault<{}, never>;

export class HookBuilder<
  /* this will be passed from the app so no deafult here remove it after done with testing purposes*/ Elements extends HookOrderedRecordEntry[]
> {
  public _elements: HookOrderedRecord<Elements>;
  constructor(elements: Elements = []) {
    // so that we can only access it from within the class only since i dont want to expose it to the user
    this._elements = new OrderedRecord<Elements, HookOrderedRecordEntry>(
      elements
    );
  }

  add<Return, HookName extends string>(handler: {
    key: HookName;
    execute: Handler<
      WithDefault<{}, ReturnType<Last<Elements>["execute"]>>,
      Return
    >;
  }): HookBuilder<[...Elements, typeof handler]> {
    return new HookBuilder(this._elements.add(handler))
  }



    build() {
      return this._elements
  }
}

function hihi(v: string) { 
    if (v.length == 3) {
        return "g" 
    } else {
        return "j"
    }
}

const gg = new HookBuilder()
  .add({
    key: "koko",
    execute: (v) => {
      return {
        hi: "",
      };
    },
  } as const)
  .add({
    key: "lolo",
    execute: (v) => {
      return {
        ...v,
        koki: hihi("so"),
      }   // to ensure no modification and better type inference e,g, it shortnes the scope as much as possible 
    },
  } as const)
  .add({
    key: "koki",
    execute: (v) => {},
  } as const).build()