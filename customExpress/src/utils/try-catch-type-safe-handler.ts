import { Errorable } from './../non-lib-specific-things/Errorable';

export class ErrorType {
    private msg: string
    constructor(message: string) { this.msg = message; }
    public get message(): string { return this.msg; }
}



export async function typeSafeTryCatch<Expected, Error>(
    statementWhichCouldReturn: () => Promise<Expected>,
    handleError: (error: {message: string}) => Promise<Error>
): Promise<[Expected | null, Error | null]>{
    try {
        return   [await statementWhichCouldReturn(), null];
    } catch (error) {
        if (error.message === undefined || error.message === null) {
            throw new Error("error doesnt have msg");
        }
        const typeSafeError = {message: error.message}
        return [null, await handleError(typeSafeError)];
    }
}


export async function transformTryCatchFunctionIntoResult<T>(statementWhichCouldReturn: () => Promise<T>): Promise<[T | null, ErrorType | null]> {
    try {
        return [await statementWhichCouldReturn(), null]
    } catch (error) {
        return [null, new ErrorType(error.message)] 
    }
}