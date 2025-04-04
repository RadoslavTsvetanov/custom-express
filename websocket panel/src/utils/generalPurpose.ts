
function stripMethods<T extends object>(obj: T): { // live laugh love ts this type system is goated
    [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K]
} {
    return JSON.parse(JSON.stringify(obj));
}

