# Smart Config Utility

A type-safe, schema-based configuration management utility built with TypeScript and Zod. This utility provides a fluent API for managing application configuration with type safety and runtime validation.

## Installation

```bash
npm install @your-org/smart-config
# or
yarn add @your-org/smart-config
```

## Features

- **Type Safety**: Full TypeScript support with inferred types
- **Schema Validation**: Built on Zod for runtime validation
- **Fluent API**: Chainable methods for configuration
- **Group Operations**: Enable/disable multiple boolean flags at once
- **Number Operations**: Increment/decrement numeric values with type safety

## Basic Usage

```typescript
import { smartConfig } from '@your-org/smart-config';
import { z } from 'zod';

// Define your configuration schema
const appSchema = z.object({
  name: z.string(),
  isAdult: z.boolean(),
  isFeatureEnabled: z.boolean(),
  age: z.number(),
  apiUrl: z.string().url()
});

// Create a new config instance
const config = new smartConfig(appSchema)
  .set('name', 'My App')
  .set('age', 25)
  .set('apiUrl', 'https://api.example.com')
  .enable('isFeatureEnabled');

// Get values
const appName = config.get('name'); // 'My App'
const isAdult = config.get('isAdult'); // false (default boolean value)

// Toggle boolean values
config.flip('isFeatureEnabled');
```

## API Reference

### Constructor

```typescript
new smartConfig<T extends ZodObject>(schema: T, initialValues?: Partial<z.infer<T>>)
```

### Instance Methods

#### `set<Key, Value>(key: Key, value: Value)`
Set a configuration value.

```typescript
config.set('name', 'New Name');
```

#### `enable(key: keyof BooleanFields<T>)`
Enable a boolean flag.

```typescript
config.enable('isFeatureEnabled');
```

#### `disable(key: keyof BooleanFields<T>)`
Disable a boolean flag.

```typescript
config.disable('isFeatureEnabled');
```

#### `flip(key: keyof BooleanFields<T>)`
Toggle a boolean flag.

```typescript
config.flip('isFeatureEnabled');
```

#### `increment(key: keyof NumberFields<T>)`
Increment a numeric value by 1.

```typescript
config.increment('retryCount');
```

#### `decrement(key: keyof NumberFields<T>)`
Decrement a numeric value by 1.

```typescript
config.decrement('retryCount');
```

#### `enableGroup(keys: Array<keyof BooleanFields<T>>)`
Enable multiple boolean flags at once.

```typescript
config.enableGroup(['isFeatureA', 'isFeatureB']);
```

#### `incrementGroup(keys: Array<keyof NumberFields<T>>)`
Increment multiple numeric values at once.

```typescript
config.incrementGroup(['retryCount', 'maxAttempts']);
```

#### `get<Key extends keyof T>(key: Key)`
Get a configuration value.

```typescript
const value = config.get('someKey');
```

#### `raw()`
Get the raw configuration object.

```typescript
const allValues = config.raw();
```

## Advanced Usage

### Using with Cache Configuration

The package includes a pre-defined cache configuration schema:

```typescript
import { cacheConfig } from '@your-org/smart-config';

// Configure cache settings
cacheConfig
  .set('active', true)
  .set('ttl', 3600)
  .set('group', 'user-sessions');
```

### Available Cache Configuration Options

- `active`: boolean - Enable/disable caching
- `disable`: string[] - List of cache keys to disable
- `ttl`: number - Time to live in seconds
- `key`: (args: any) => any - Function to generate cache keys
- `tags`: string[] - Cache tags for invalidation
- `group`: string - Cache group name
- `resolver`: (key: string, value: any) => any - Custom resolver function
- `shouldReturn`: (value: any) => boolean - Condition to determine if value should be cached
- `bypassIf`: (args: any) => boolean - Condition to bypass caching
- `dependsOn`: string[] - Dependencies for cache invalidation
- `errorFallback`: boolean - Enable error fallback
- `autoRefreshInterval`: number - Auto-refresh interval in milliseconds
- `plannedMiss`: (key: string) => boolean - Force cache miss for specific keys
- `metadataResolver`: (key: string, value: any) => any - Custom metadata resolver

## Type Safety

The utility leverages TypeScript's type system to ensure type safety:

- Boolean operations only work on boolean fields
- Number operations only work on number fields
- All operations are type-checked at compile time
- Return types are properly inferred

## License

MIT
