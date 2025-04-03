import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { GetSet } from "../getSetClass";

export class OrderedRecord<Keys extends string, V extends { key: Keys }> {
  public readonly elements: GetSet<V[]> = new GetSet<V[]>([]);
  private indexesMap: Record<Keys, number> = {};

  constructor(elements: V[]) {
    elements.forEach((element, index) => {
      this.indexesMap[element.key] = index;
    });
    this.elements.setV(elements);
  }

  get(key: Keys): Optionable<V> {
    console.log("hhh", this.elements.value[this.indexesMap[key]])
    return new Optionable(this.elements.value[this.indexesMap[key]]);
  }

  getIndexOfKey(key: Keys): number | undefined {
    return this.indexesMap[key];
  }

  set(value: V): void {
    if (this.indexesMap[value.key] === undefined || this.indexesMap === null) {
      return
    }
    const index = this.indexesMap[value.key];
    if (index !== undefined) {
      this.elements.map((array) => {
        array[index] = value;
        return array;
      });
    }
  }

  add<NewKey extends string>(
    v: Omit<V, "key"> & { key: NewKey extends Keys ? never : NewKey },
    position?: number
  ): NewKey extends Keys ? OrderedRecord<Keys | NewKey, V> : never {
    if (!this.get(v.key).is_none()) {
      throw new Error("key already exists")
    }

    return this.elements.map((array) => {
      const newArray = [...array];
      const newIndexMap: Record<Keys | NewKey, number> = { ...this.indexesMap };

      if (position === undefined) {
        newArray.push(v);
        newIndexMap[v.key] = newArray.length - 1;
      } else {
        newArray.splice(position, 0, v);
        Object.keys(newIndexMap).forEach((key) => {
          if (newIndexMap[key as Keys] >= position) {
            newIndexMap[key as Keys] += 1;
          }
        });
        newIndexMap[v.key] = position;
      }

      return new OrderedRecord<Keys | NewKey, V>(newArray);
    });
  }
}
