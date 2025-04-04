import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { GetSet } from "../getSetClass";

type Widen<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends Array<infer U> ? Array<Widen<U>> :
  T extends object ? { [K in keyof T]: Widen<T[K]> } :
  T;

export class OrderedRecord<
  V extends readonly Schema[],
  Schema extends {key: string} 
> {
  public get getElementsType(): V {  // use only as means to gget the type of the elemnts inside e.g. get the V generic
    return
  }
  public readonly elements: GetSet<V> = new GetSet<V>([] as unknown as V);

  constructor(elements: V) {
    this.elements.setV(elements);
  }


  get(key: V[number]["key"]): Optionable<V[number]> {
    return new Optionable(this.elements.value.find((el) => el.key === key));
  }

  placeBefore<NewValueKey extends string>(
    key: V[number]["key"],
    newValue: Omit<V[number], "key"> & { key: NewValueKey }
  ) {
    return this.add(
      newValue,
      this.elements.value.findIndex((el) => el.key === key)
    );
  }

  placeAfter<NewValueKey extends string>(
    key: V[number]["key"],
    newValue: Omit<V[number], "key"> & { key: NewValueKey }
  ) {
    return this.add(
      newValue,
      this.elements.value.findIndex((el) => el.key === key) + 1
    );
  }

  getIndexOfKey(key: V[number]["key"]): number | undefined {
    return this.elements.value.findIndex((el) => el.key === key);
  }

  set(value: V[number]): void {
    const index = this.elements.value.findIndex((el) => el.key === value.key);
    if (index !== -1) {
      this.elements.map((array) => {
        array[index] = value;
        return array;
      });
    }
  }

  public g: Schema

  add<NewKey extends string, T extends Widen<AdditionalData> & {key: string}, AdditionalData extends Omit<Schema, "key">>(
    // v: Omit<V[number], "key"> & { key: NewKey /* extends Keys ? never : NewKey */ },
    v: T,
    position?: number
  ): // NewKey extends Keys
    //? never
    /* : */ OrderedRecord<readonly [  ...V, typeof v ], Schema> {
    if (!this.get(v.key).is_none()) {
      throw new Error("key already exists");
    }

    return this.elements.map((array) => {
      const newArray = [...array] as [...V, { key: NewKey }];
      if (position === undefined) {
        newArray.push(v);
      } else {
        newArray.splice(position, 0, v);
      }
      return new OrderedRecord<typeof newArray>(newArray);
    });
  }
}


const initialElements = [
  { key: "apple" as const, value: 10 } ,
  { key: "banana" as const, value: 20 } ,
] as const;
const ggg = new OrderedRecord<readonly [{key: "apple", value: 10},{key:"banana", value: "20"}],{key: string, value: number}>(initialElements)
type o = typeof ggg.g
// Create an OrderedRecord instance
const fruits = ggg.add({
  key: "lolo",
  value: 4
} as const).add({
  value: 6,
  key: "koiki"
} as const); // again important to be as const to get the type info 

type j = typeof fruits["elements"]["value"]["2"]


fruits.elements.value[3].key
// ^? 