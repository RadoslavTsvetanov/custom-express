
import { Entity, Schema, Repository, Client, type SchemaDefinition, type SchemaOptions, EntityId } from 'redis-om';
import type { RedisORMSchema } from './types';
import type { inferRedisSchema } from './types';

export function createRedisSchema<
  T extends RedisORMSchema, 
>(name: string, schema: T, options?: SchemaOptions){
  return new Schema<inferRedisSchema<T>>(name, schema, options);
}