import { z, ZodAny, ZodBoolean, ZodSchema, ZodUnknown, type ZodObject, type ZodRawShape } from "zod";
import { Optionable } from "@blazyts/better-standard-library";

class QueryBuilder<Schema extends Record<string, Value>> {


    constructor(schema: Schema) {








interface Statement<T extends Record<string, unknown>> {
    type: "and" | "or" | "none"
}

class AndStatement<T extends Record<string, unknown>> implements Statement<T> {
    type = "and" as const
    constructor(statemnt1: Statement<T>, statemnt2: Statement<T>) { }
}

class OrStatement<T extends Record<string, unknown>> implements Statement<T> {
    type = "or" as const
    constructor(statemnt1: Statement<T>, statemnt2: Statement<T>) { }
}


class Selector<T extends Record<string, unknown>> {
    constructor(public selector: { [K in keyof T]:
        T[K] extends number
        ? { "lessThan": number, "greaterThan": number, "equal": number } & is<number>
        : T[K] extends string
        ? { "contains": string, "startsWith": string, "endsWith": string, matchesRegex: string } & is<string>
        : T[K] extends boolean
        ? { "true": boolean, "false": boolean, "equal": boolean } & is<boolean>
        : never
    }) { }
}

class NoneStatement<T extends Record<string, unknown>> implements Statement<T> {
    type = "none" as const

    constructor(statement: Selector<T>) {
    }
}

class Query<T extends Record<string, unknown>> {

    private constructor(public statement: Statement<T>) {
    }

    static new<T extends Record<string, unknown>>(): Query<T> {
        return new Query(new NoneStatement(new Selector({})))
    }

    and(statement: Statement<T>): Query<T> {
        return new Query(new AndStatement(this.statement, statement))
    }

    or(statement: Statement<T>): Query<T> {
        return new Query(new OrStatement(this.statement, statement))
    }

    none(statement: Selector<T>): Query<T> {
        return new Query(new NoneStatement(statement))
    }
}

Query.new<{ name: string, age: number }>().and(
)



{
    and: [
        {
            or: [
                {
                    name: {
                        eq: "name"
                    }
                },
                {
                    name: {
                        contains: "bobo"
                    }
                }
            ]
        },
        {
            name: {
                lessThan: 18
            }
        }
    ]
}


