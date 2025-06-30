
export type RedisORMSchema = Record<string, {type: "string" | "number" | "boolean" | "Date" | "object" | "string[]" | "number[]" | "boolean[]" | "Date[]" | "object[]", indexed?: boolean}>;  


export type inferType<T extends RedisORMSchema[keyof RedisORMSchema]['type']> = 
   T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : T extends "Date" ? Date : T extends "object" ? object : T extends "string[]" ? string[] : T extends "number[]" ? number[] : T extends "boolean[]" ? boolean[] : T extends "Date[]" ? Date[] : T extends "object[]" ? object[] : never;


export type inferRedisSchema<T extends Record<string, {type: "string" | "number" | "boolean" | "Date" | "object" | "string[]" | "number[]" | "boolean[]" | "Date[]" | "object[]"}>> = {
  [key in keyof T]: inferType<T[key]['type']>;
}