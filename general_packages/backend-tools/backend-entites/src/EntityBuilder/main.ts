import { ZodObject, ZodRawShape, z } from "zod";
import type { Action } from "./types";
import type { Last } from "@blazyts/better-standard-library";

export class EntityBuilder<
  Befores extends readonly ZodObject<any>[] = [],
  Actions extends Record<string, Action<any, any>> = {}
> {
  private befores: Befores = [] as Befores;
  private actions: Actions = {} as Actions;

  before<T extends ZodObject<ZodRawShape>>(input: {
    data: T;
    handler: (v: z.infer<T>) => void;
  }): EntityBuilder<[...Befores, T], Actions> {
    input.handler(input.data.parse({})); // type-safe dummy usage
    const updated = new EntityBuilder<[...Befores, T], Actions>();
    updated.befores = [...this.befores, input.data] as [...Befores, T];
    updated.actions = this.actions;
    return updated;
  }

  addAction<Name extends string, T extends ZodObject<ZodRawShape>>(
    name: Name,
    input: {
      data: T;
      handler: (v: z.infer<T> & z.infer<Last<Befores>>) => void;
    }
  ): EntityBuilder<
    Befores,
    Actions & { [K in Name]: Action<T, z.infer<Last<Befores>>> }
  > {
    const lastBefore = this.getLastBefore();
    const mergedSchema = lastBefore ? input.data.merge(lastBefore) : input.data;

    const updated = new EntityBuilder<
      Befores,
      Actions & { [K in Name]: Action<T, z.infer<Last<Befores>>> }
    >();
    updated.befores = this.befores;
    updated.actions = {
      ...this.actions,
      [name]: {
        data: {} as any,
        schema: mergedSchema,
        handler: input.handler
      }
    } as any;
    return updated;
  }

  private getLastBefore(): ZodObject<any> | undefined {
    return this.befores.length > 0 ? this.befores[this.befores.length - 1] : undefined;
  }

  getActions() {
    return this.actions;
  }
}
