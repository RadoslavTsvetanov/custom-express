import { Last, OrderedRecord } from "@custom-express/better-standard-library";
import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { Handler } from "../../../types/Message/main";


type WithDefault<Default, Type> = [Type] extends [never] ? Default : Type;

type g = WithDefault<{}, never>;

export class HookBuilder<
  /* this will be passed from the app so no deafult here remove it after done with testing purposes*/ Elements extends HookOrderedRecordEntry[]
> {
  public _elements: HookOrderedRecord<Elements>;
  constructor(elements: Elements = [] as const) {
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

  static new() {
    return new HookBuilder([] as const)
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

// Note when making a hook builder for the inference and type retaining to work you must provide an arg in the cinstrcutor if you are gonna use it directly as in this example although a simple `([] as const)` will work as good 

{
  const gg = new HookBuilder([{ key: "g", execute: async g => "" }] as const)
    .add({
      key: "koko",
      execute: (v) => {
        return {
          hi: "",
        } as const // yeah add as const whnenver you can for type inference we will figure it out eventually how to minimize the need for adding as const 
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
      execute: (v) => { },
    } as const).build().elements.value[1]
    // should be const gg: {
    // key: "koko";
    // execute: Handler<Promise<string>, {
    //     readonly hi: "";
    // }>;
// }
}


{
  const h = HookBuilder.new()
    .add({ key: "koko", execute: v => { return { hi: "" } as const } } as const)
    .add({
      key: "jiji", execute: v => {
        v.hi // should be intellisensed as string
        
        return {
          koko: {
            lolo: ""
          }
        } as const
      }
    } as const)
    .build()
  

  {
    const g = h.elements.value[0]
//     should be (property) 0: {
//     key: "koko";
//     execute: Handler<{}, {
//         readonly hi: "";
//     }>;
// }
  }
}