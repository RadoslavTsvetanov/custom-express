import { Err, Ok } from "better-standard";

// Basic Result creation and pattern matching
const success = Ok(42);
const failure = Err("Something went wrong");

// Pattern matching
const value = success.match({
    Ok: val => val * 2,
    Err: err => 0,
});

// Chaining operations
const result = success
    .map(val => val * 2)
    .mapErr(err => `Error: ${err}`);

console.log("Value:", value); // Should print 84
console.log("Result:", result.unwrapOr(0)); // Should print 84
