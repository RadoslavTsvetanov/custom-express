function tap<T>(fn: (value: T) => void): (value: T) => T {
    return (value: T): T => {
        fn(value);
        return value;
    };
}

export { tap };
