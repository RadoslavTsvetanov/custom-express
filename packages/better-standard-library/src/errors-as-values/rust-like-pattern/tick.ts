import { VCallback } from "../../types/voidcallback";

// the tick interface allows you to try something on a value and return the value but whatever you did on the value does not affect the original value , essentiually it allws toi make debug calls without bothering the main logic handler
export interface Tick<T> {
  tick: (callback   : VCallback<T>) => T;
}

// // Example usage
// const tick: Tick<number> = (value) => {
//   console.log("Trying something with:", value);
//   return value; // Ensuring the original value is returned unmodified
// };

// const result = tick(42); // Logs "Trying something with: 42"
// console.log(result); // 42