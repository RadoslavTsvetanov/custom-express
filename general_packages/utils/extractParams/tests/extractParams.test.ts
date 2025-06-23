import { describe, it, expect, expectTypeOf } from 'vitest';
import { extractParams, type ExtractParams } from '../src/index';
import type { Optionable } from '@blazyts/better-standard-library'; // Import Optionable for type assertions

describe('ExtractParams', () => {
  // Runtime tests for the type utility
  describe('Type Tests', () => {
    it('should extract single parameter', () => {
      type Result = ExtractParams<'/users/:id'>;
      const _test: Result = { id: '123' };
      expect(_test).toHaveProperty('id');
    });

    it('should extract multiple parameters', () => {
      type Result = ExtractParams<'/users/:userId/posts/:postId'>;
      const _test: Result = { userId: '123', postId: '456' };
      expect(_test).toHaveProperty('userId');
      expect(_test).toHaveProperty('postId');
    });

    it('should handle no parameters', () => {
      type Result = ExtractParams<'/users'>;
      const _test: Result = {};
      expect(_test).toEqual({});
    });

    it('should handle mixed static and dynamic segments', () => {
      type Result = ExtractParams<'/api/v1/users/:userId/profile'>;
      const _test: Result = { userId: '123' };
      expect(_test).toHaveProperty('userId');
    });
  });

  // Type-level tests using type assertions
  describe('Type Assertions', () => {
    it('should correctly infer parameter types', () => {
      type SingleParam = ExtractParams<'/users/:id'>;
      const _singleParam: SingleParam = { id: '123' };
      // @ts-expect-error - should not allow missing id
      const _missingId: SingleParam = {};
      // @ts-expect-error - should not allow extra properties
      const _extraProp: SingleParam = { id: '123', extra: 'test' };
    });

    it('should handle complex paths', () => {
      type ComplexPath = ExtractParams<'/api/v1/users/:userId/posts/:postId/comments/:commentId'>;
      const _complex: ComplexPath = { 
        userId: '1', 
        postId: '2', 
        commentId: '3' 
      };
      
      // @ts-expect-error - missing required properties
      const _missingProps: ComplexPath = { userId: '1' };
    });

    it('should handle empty path', () => {
      type EmptyPath = ExtractParams<''>;
      const _empty: EmptyPath = {} as never;
    });

    it('should handle multiple parameters with the same name', () => {
      type DuplicateParams = ExtractParams<'/users/:id/items/:id'>;
      const _duplicate: DuplicateParams = { id: '123' };
      // Note: This is expected behavior as TypeScript merges identical property types
    });
  });
});

type Merge<T> = {
  [K in keyof T]: T[K];
};

function Merge<T extends Record<string, unknown>>(v: T): {[K in keyof T]: T[K]} {
    return v;
}

expectTypeOf(Merge(extractParams('/users/:id')))
.toEqualTypeOf<{ id: string }>();

expectTypeOf(Merge(extractParams('/users/:userId/posts/:postId')))
.toEqualTypeOf<{ userId: string; postId: string }>();

expectTypeOf(Merge(extractParams('/static/route')))
.toEqualTypeOf<{}>();

expectTypeOf(Merge(extractParams('/api/v1/users/:userId/profile/:tab')))
.toEqualTypeOf<{ userId: string; tab: string }>();

expectTypeOf(Merge(extractParams('')))
.toEqualTypeOf<never>();

// Test type inference with special suffixes
expectTypeOf(Merge(extractParams('/users/:id$/profile')))
.toEqualTypeOf<{ id: number }>();

expectTypeOf(Merge(extractParams('/:createdAt(/')))
.toEqualTypeOf<{ createdAt: Date }>();

expectTypeOf(Merge(extractParams('/feature/:isEnabled^/'))) // Note if a dyncamic param is at the end place a trailing "/"
.toEqualTypeOf<{ isEnabled: boolean }>();

// Test optional parameters

expectTypeOf(Merge(extractParams('/users/:?userId/')))
.toEqualTypeOf<{ userId: Optionable<string> }>();

expectTypeOf(Merge(extractParams('/users/:?userId$/profile/:?tab/')))
.toEqualTypeOf<{ userId: Optionable<number>; tab: Optionable<string> }>();


() => {
const j = Merge(extractParams('/api/v1/users/:userId/posts/:postId(/:?page$/:?limit$/'))
expectTypeOf(j)
.toEqualTypeOf<{ 
  userId: string; 
  postId: Date;
  page: Optionable<number>;
  limit: Optionable<number>;
}>();
}
() => {
const j = Merge(extractParams('/api/v1/users/:userId/posts/:postId(/:?page$/:?limit^/:?sort)/'))
expectTypeOf(j)
.toEqualTypeOf<{ 
  userId: string; 
  postId: Date;
  page: Optionable<number>;
  limit: Optionable<boolean>;
  sort: Optionable<string>;
}>();

}
expectTypeOf(Merge(extractParams('/users/:user-id$/profile')))
.toEqualTypeOf<{ userid: number }>();

expectTypeOf(Merge(extractParams('/users/:user_id(/')))
.toEqualTypeOf<{ userid: Date }>();

// Test edge cases
expectTypeOf(Merge(extractParams('/:?')))
.toEqualTypeOf<{}>();

expectTypeOf(Merge(extractParams('/:?invalidParam!@#')))
.toEqualTypeOf<{ invalidparam: Optionable<string> }>();

// Test with query parameters (should be treated as regular parameters)
expectTypeOf(Merge(extractParams('/search?:query/:page$')))
.toEqualTypeOf<{ query: Optionable<string>; page: number }>();

// Test with multiple optional parameters
() => {
const j = Merge(extractParams('/api/:?filter^/:?page$/:?limit$/'))
expectTypeOf(j)
.toEqualTypeOf<{ 
  filter: Optionable<boolean>;
  page: Optionable<number>;
  limit: Optionable<number>;
}>();
}