import { ErrorType as E } from "../utils/try-catch-type-safe-handler";

export class Errorable<ExpectedType, ErrorType extends E>{
    private expected: ExpectedType | null = null;
    private error: ErrorType | null = null
    constructor(expected: ExpectedType | null, error: ErrorType | null) { 
        if (expected === null && error === null) {
            throw new Error("Either expectedType or error must be provided");
        }

        if (expected !== null && error !== null) {
            throw new Error("Only expectedType or error can be provided not both");
        }

        this.error = error;
        this.expected = expected;
    }

    public getExpectedType() : ExpectedType | null {
        return this.expected;
    }

    public getError() : ErrorType | null {
        return this.error;
    }

    public expect(msg: string) {
        if (this.expected === null) {
            throw new Error(msg)
        }
    }

    public unWrap() {
        if (this.error === null) {
            return this.expected as ExpectedType;
        }
        throw new Error(this.error.message)
    }
}