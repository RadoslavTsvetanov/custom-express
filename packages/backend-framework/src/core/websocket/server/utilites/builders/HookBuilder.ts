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
    return new HookBuilder([...this._elements.elements.value, handler])
  }

  static new(): HookBuilder<[]> {// e.g. empty 
    return new HookBuilder([]  as const)
  }

    build() {
      return this._elements
  }
}


// Note when making a hook builder for the inference and type retaining to work you must provide an arg in the cinstrcutor if you are gonna use it directly as in this example although a simple `([] as const)` will work as good 

