export type Validator<T> = (v: T) => boolean
export type AsyncValidator<T> = (v: T) => Promise<boolean>