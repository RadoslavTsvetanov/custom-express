import { ZodObject, z } from "zod";

export type Action<T extends ZodObject<any>, B> = {
  data: z.infer<T> & B;
  schema: ZodObject<any>;
  handler: (v: z.infer<T> & B) => void;
};

