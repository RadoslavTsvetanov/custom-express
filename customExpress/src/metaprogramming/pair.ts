import { z, ZodAny, type ZodRawShape } from "zod";
type g = {
  h: {
    n: string
  },
  k: {
    o: number
  }
}


export type transform<T extends Record<string, ZodAny>> = {
  [K in keyof T]: (data: z.infer<z.infer<T[K]>>) => Promise<void> 
};
