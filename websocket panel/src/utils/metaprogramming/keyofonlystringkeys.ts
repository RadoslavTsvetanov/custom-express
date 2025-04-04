export type nonstringkeys<T extends string | number | symbol> = T extends number | symbol ? never : string
export type keyofonlystringkeys<T> = nonstringkeys<keyof T>