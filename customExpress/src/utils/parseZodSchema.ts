import {
  z,
  ZodObject,
  ZodString,
  ZodNumber,
  ZodUnion,
  ZodRawShape,
  ZodTypeAny,
  ZodEffects,
} from "zod";

// Function to extract constraints from Zod schema
function getConstraints(schema: ZodTypeAny): Record<string, any> {
  const constraints: Record<string, any> = {};

  // Check for max/min length for strings and arrays
  if (schema instanceof ZodString || schema instanceof ZodNumber) {
    schema._def.checks.forEach((check) => {
      if (check.kind === "min") {
        constraints.min = check.value;
      } else if (check.kind === "max") {
        constraints.max = check.value;
      } else if (check.kind === "length") {
        constraints.length = check.value;
      } else if (check.kind === "regex") {
        constraints.regex = check.regex;
      }
    });
  }

  // Check for nonempty
  if (
    schema instanceof ZodString &&
    schema._def.checks.some(
      (check) => check.kind === "length" && check.value === 0
    )
  ) {
    constraints.nonempty = true;
  }

  return constraints;
}

// Recursive function to convert ZodUnion or ZodOr schema to a plain object with constraints
export function schemaToObject(schema: ZodTypeAny): Record<string, any> {
  // Handle ZodObject
  if (schema instanceof ZodObject) {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        // Recurse if the value is a ZodObject
        if (value instanceof ZodObject) {
          return [
            key,
            {
              schema: schemaToObject(value),
              constraints: getConstraints(value),
            },
          ];
        }
        // For non-object schemas, include the type and constraints
        return [
          key,
          { type: value._def.typeName, constraints: getConstraints(value) },
        ];
      })
    );
  }

  // Handle ZodUnion (OR condition, using .union([...]))
  if (schema instanceof ZodUnion) {
    return {
      unionOptions: schema._def.options.map((option, index) => ({
        [`option_${index}`]: schemaToObject(option),
      })),
    };
  }

  // Handle ZodEffects (e.g., .or())
  if (schema instanceof ZodEffects && schema._def.effectType === "or") {
    // Now we handle `or()`, ensuring that we map each type as separate options
    return {
      orOptions: schema._def.options.map((option, index) => ({
        [`option_${index}`]: {
          type: option._def.typeName,
          constraints: getConstraints(option),
        },
      })),
    };
  }

  // Return an empty object for unsupported schema types (just in case)
  return {};
}

// Example Usage with ZodUnion (OR condition) and .or()
const userSchema = z.object({
  id: z.number().max(20),
  name: z.string().min(3).max(20).nonempty(),
  contact: z
    .object({
      email: z.string().email(),
      phone: z.string().min(10).max(15),
    })
    .or(
      z.object({
        skype: z.string().nonempty(),
        phone: z.string().min(10).max(15),
      })
    ),
  address: z.object({
    city: z.string().nonempty(),
    zip: z.number().max(99999),
  }),
});

console.log(JSON.stringify(schemaToObject(userSchema), null, 2));
