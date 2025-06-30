import z from "zod"

export type getOnlyBooleans<T extends z.ZodObject<any>> = {
  [K in keyof z.infer<T> as z.infer<T>[K] extends boolean ? K : never]: z.infer<T>[K];
}


export type getOnlyStrings<T extends z.ZodObject<any>> = {
    [K in keyof z.infer<T> as z.infer<T>[K] extends string ? K : never]: z.infer<T>[K];
}


export type getOnlyNumbers<T extends z.ZodObject<any>> = {
    [K in keyof z.infer<T> as z.infer<T>[K] extends number ? K : never]: z.infer<T>[K];
}