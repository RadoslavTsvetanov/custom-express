import type { z, ZodObject } from 'zod'

export namespace MyZodDefinitions {
  export type _def = {
    checks: DataCheck[]
    typeName: Shapes
    description?: string
  }

  export type ObjectUnion<> = readonly [ZodObject<any>, ...ZodObject<any>[]]

  export type ZodObjectUnion<
    T extends ObjectUnion,
  > = z.ZodUnion<T>
  // const schema: ZodObjectUnion<
  //   readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]
  // > = z.union([z.string(), z.number(), z.boolean()]);

  // Example ----------------------------------------------------------------

  //   function f<T extends readonly [ZodObject<any>, ...ZodObject<any>[]]>(
  //     v: ZodObjectUnion<T>
  //   ): ZodObjectUnion<T> {
  //     return v;
  //   }

  //   // Correct usage of `z.union` with an array of Zod objects
  //   const schema = z.union([
  //     z.object({ foo: z.string() }),
  //     z.object({ bar: z.number() }),
  //   ]);

  //   // Now calling the function with the schema
  //   const result = f(schema); //

  //     function ggg (v: z.infer<typeof schema>) {

  //     }

  // ggg({ foo: "" })

  // ----------------------------------------------------------------------

  // const huhu = z.object({
  //   kur: z.number(),
  // });

  export type ZodLike = {
    _def: {
      innerType?: {
        _def: _def
      }
    } & _def
  }
  export type DataCheck = {
    kind: string
    value: any
  }
  export enum Shapes {
    String = 'ZodString',
    Number = 'ZodNumber',
    NaN = 'ZodNaN',
    BigInt = 'ZodBigInt',
    Boolean = 'ZodBoolean',
    Date = 'ZodDate',
    Symbol = 'ZodSymbol',
    Undefined = 'ZodUndefined',
    Null = 'ZodNull',
    Any = 'ZodAny',
    Unknown = 'ZodUnknown',
    Never = 'ZodNever',
    Void = 'ZodVoid',
    Array = 'ZodArray',
    Object = 'ZodObject',
    Union = 'ZodUnion',
    DiscriminatedUnion = 'ZodDiscriminatedUnion',
    Intersection = 'ZodIntersection',
    Tuple = 'ZodTuple',
    Record = 'ZodRecord',
    Map = 'ZodMap',
    Set = 'ZodSet',
    Function = 'ZodFunction',
    Lazy = 'ZodLazy',
    Literal = 'ZodLiteral',
    Enum = 'ZodEnum',
    Effects = 'ZodEffects',
    NativeEnum = 'ZodNativeEnum',
    Optional = 'ZodOptional',
    Nullable = 'ZodNullable',
    Default = 'ZodDefault',
    Catch = 'ZodCatch',
    Promise = 'ZodPromise',
    Branded = 'ZodBranded',
    Pipeline = 'ZodPipeline',
    Readonly = 'ZodReadonly',
  }
}
