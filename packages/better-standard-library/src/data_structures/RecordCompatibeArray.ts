import type { TrueMap } from "../errors-as-values/mapThatIsLikeInRust";
import type { Mapable } from "../errors-as-values/src/rust-like-pattern/mapable";
import { Optionable } from "../errors-as-values/src/rust-like-pattern/option";
import type { Last } from "../metaprogramming/tuple/getLast";
import { GetSet } from "./getSetClass";

type WithKey<T> = {key: string} & T

type Widen<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends Array<infer U>
  ? Array<Widen<U>>
  : T extends object
  ? { [K in keyof T]: Widen<T[K]> }
  : T;

export class OrderedRecordBase<
  V extends readonly Schema[],
  Schema extends { key: string }
> extends Array<Schema>{
  public get getElementsType(): V {
    // use only as means to gget the type of the elemnts inside e.g. get the V generic
    return;
  }
  public readonly elements: GetSet<V> = new GetSet<V>([] as unknown as V);

  constructor(elements: V) {
    super(...elements)
    this.elements.setV(elements);
  }

  public getByPosition<Index extends readonly number>(
    index: Index
  ): Optionable<V[Index]>;

  public get toNormalObject(): {
    [K in V[number]["key"]]: Omit<Extract<V[number], { key: K }>, "key">;
  } {
    return this.elements.value.reduce((acc, item) => {
      acc[item.key] = item; // We can safely assume `item` matches the type since it's of type `V[number]`
      return acc;
    }, {} as { [K in V[number]["key"]]: Omit<Extract<V[number], { key: K }>, "key"> });
  }

  get(key: V[number]["key"]): Optionable<V[]> {
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

  public g: Schema;

  add<
    NewKey extends string,
    T extends Widen<AdditionalData> & { key: string },
    AdditionalData extends Omit<Schema, "key">
  >(
    // v: Omit<V[number], "key"> & { key: NewKey /* extends Keys ? never : NewKey */ },
    v: T,
    position?: number
  ): // NewKey extends Keys
  //? never
  /* : */ OrderedRecord<readonly [...V, typeof v], Schema> {
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

// // EXample usage  and how it should work
const initialElements = [
  { key: "apple" as const, value: 10 },
  { key: "banana" as const, value: 20 },
] as const;
const ggg = new OrderedRecordBase(initialElements);
// Create an OrderedRecord instance
const fruits = ggg
  .add({
    key: "lolo",
    value: 4,
  } as const)
  .add({
    value: 6,
    key: "koiki",
  } as const); // again important to be as const to get the type info

type j = (typeof fruits)["elements"]["value"]["3"];

fruits.toNormalObject.apple.value; // shpuld be of type 10
fruits.toNormalObject.koiki.value; // should be of type 6

const gg = fruits.elements.value[3]; // should be of {6, "koiki"}

const g2 = fruits.elements.value[0] // should be  {
    // readonly key: "apple";
    // readonly value: 10;
// }

const g3= fruits.elements.value[3]
// shoukd be {
//     readonly value: 6;
//     readonly key: "koiki";
// }
fruits
  .getByPosition(2)
  .ifCanBeUnpacked((v) => v /* {readonly key: "lolo";readonly value: 4;}*/);

export class OrderedRecord
  <
    V extends readonly Schema[],
    Schema extends { key: string }
  >
  extends OrderedRecordBase
  <
    V, 
    Schema 
  > {

  public get lastElement(): Last<[V]> {
    return this.elements.value[this.elements.value.length - 1]
  }

}





const g = new  OrderedRecord([{key: "jiji", handler: () => {g: ""}}] as const).add({key: "gyog", handler: () => 4}as const)

const a = g.elements.value[0]
// should be {
//     readonly key: "jiji";
//     readonly handler: () => void;
// }
const gt = g.elements.value[1]
// should be const gt: {
//     readonly key: "gyog";
//     readonly handler: () => 4;
// }