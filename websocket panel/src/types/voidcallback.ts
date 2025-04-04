export type Callback<ReturnType, Value> = (v: Value) => ReturnType
export type VCallback<T> = Callback<void, T>