import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { GetSet } from "../getSetClass";

export class OrderedRecord<Keys extends string, V extends { key: Keys }> {
  public readonly elements: GetSet<V[]> = new GetSet<V[]>([]);
  private indexesMap: Record<Keys, number> = {} as Record<Keys, number> // since every value is stored in an  array for quick access we keep a list of the indexes where each value is stored 

  constructor(elements: V[]) {
    elements.forEach((element, index) => {
      this.indexesMap[element.key] = index;
    });
    this.elements.setV(elements);
  }

  public jojo: keyof typeof this.elements.value

  get(key: Keys): Optionable<V> {
    return new Optionable(this.elements.value[this.indexesMap[key]]);
  }

  get normalObject(): {
    [K in keyof typeof this.elements.value]: Omit<>
  } {

  }

  placeBefore<NewValueKey extends string>(key: Keys, newValue: Omit<V, "key"> & {
    key: NewValueKey
  }) {
    return this.add(newValue, this.indexesMap[key] - 1)
  }

  placeAfter<NewValueKey extends string>(key:  Keys, newValue: Omit<V, "key"> & {key: NewValueKey}) {
    return this.add(newValue, this.indexesMap[key] + 1)
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
  ): NewKey extends Keys ? never  : OrderedRecord<Keys | NewKey, V> {
    if (!this.get(v.key).is_none()) { // ignore this error we are just double checking 
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
