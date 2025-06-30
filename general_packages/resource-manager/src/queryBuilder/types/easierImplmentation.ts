
type Or<T extends any[]> = T[number];

type QlAnd<T > = {
    and: [QLNone<T>, QLNone<T>]
}

type QlOr<T > = {
    or: [QLNone<T>, QLNone<T>]
}

type QLNone<T> = {
                    [K in keyof T]?:
                        T[K] extends number
                        ? Partial<{ "lessThan": number, "greaterThan": number, "equal": number } & is<number>>
                        : T[K] extends string
                            ? Partial<{ "contains": string, "startsWith": string, "endsWith": string, matchesRegex: string } & is<string>>
                            : T[K] extends boolean
                                ? { "true": boolean, "false": boolean, "equal": boolean } & is<boolean>
                                : never
} | {or: QlOr<T>} // we havent added and since by default it is and behaviour when multiple entries are present 


class Query2<T extends Record<string, unknown>> {
    constructor(
        public statement: Or<[QlAnd<T>,QlOr<T>,{none: QLNone<T>}]>
    ) { }
}

new Query2<{ name: string, age: number }>({
    and : [
            {
                "name": {
                    "contains": "l"
                }
            },
            {
                name: {
                    contains: "lp"
                }
            }
    ]
})
