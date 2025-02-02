/**
 * Functional programming utility to compose functions from left to right.
 * Each function takes the output of the previous function as its input.
 */
export const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value)

/**
 * Creates a new array with elements that pass the predicate function.
 * This is a curried version of Array.prototype.filter.
 */
export const filter = <T>(predicate: (value: T) => boolean) =>
  (array: T[]): T[] => array.filter(predicate)

/**
 * Creates a new array with the results of calling the mapper function.
 * This is a curried version of Array.prototype.map.
 */
export const map = <T, U>(mapper: (value: T) => U) =>
  (array: T[]): U[] => array.map(mapper)

/**
 * Reduces an array to a single value using the reducer function.
 * This is a curried version of Array.prototype.reduce.
 */
export const reduce = <T, U>(reducer: (acc: U, value: T) => U, initial: U) =>
  (array: T[]): U => array.reduce(reducer, initial)

/**
 * Returns true if any element in the array passes the predicate.
 * This is a curried version of Array.prototype.some.
 */
export const some = <T>(predicate: (value: T) => boolean) =>
  (array: T[]): boolean => array.some(predicate)

/**
 * Returns true if all elements in the array pass the predicate.
 * This is a curried version of Array.prototype.every.
 */
export const every = <T>(predicate: (value: T) => boolean) =>
  (array: T[]): boolean => array.every(predicate) 