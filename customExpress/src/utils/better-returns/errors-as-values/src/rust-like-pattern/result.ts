import { LeftRight } from "./leftRight";
import { type IOptionable, Optionable } from "./option";
import { CustomUnpackable, type Unpackable } from "./unpackable/unpackable";

export interface ICustomError {
  message: string;
}

type Errors = Record<string, Optionable<ICustomError>>

export class CustomError implements ICustomError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

interface IResult<T, E extends Errors> {
  expect(msg: string): void;
}




function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export class Result<T, E extends Errors>
  extends CustomUnpackable<T>
  implements IResult<T, E>
{
  private error: Optionable<E>;
  protected safeMode = true 
  constructor(value: Optionable<T>, error: Optionable<E>) {
 
    super(value.unpack_with_default(null as T), (e) => error.is_none());
    this.error = error;
    if (value.is_none() && error.is_none()) {
      throw new Error("Either value or error must be provided");
    }
    if (!value.is_none() && !error.is_none()) {
      throw new Error("Only value or error can be provided, not both");
    }




      error.ifCanBeUnpacked((definedError) => {
      Object.entries(definedError).forEach(([key, value]) => {
        value.ifCanBeUnpacked((v) => {
          value.ifCanBeUnpacked(
            (v) => this.messageWhenYouCntUnpack = v.message
          );
        })
      });

      })
  }

  
  public getError(): Optionable<E>{
    return this.error;  
  }

  public static Ok<T, E extends Errors>(v: T): Result<T, E>{
    return new Result<T, E>(new Optionable(v), new Optionable < E >(null))
  }

  public static NotOk<T, E extends Errors>(e: E): Result<T, E>{
    return new Result<T, E>(new Optionable<T>(null), new Optionable(e))
  }


  static async transformFunctionThatThrowsIntoResult<ExpectedResponseType>(
    functionThatCouldThrow: () => Promise<ExpectedResponseType>
  ) : Promise<Result<ExpectedResponseType, {errorThrownFromTheFunction: Optionable<ICustomError> }>> {
    try {
      return new Result(
        new Optionable<ExpectedResponseType>(await functionThatCouldThrow()),
        (new Optionable<{ errorThrownFromTheFunction : Optionable<ICustomError>}>(null))
      );
    } catch (err: any) {
      return new Result(
        new Optionable<ExpectedResponseType>(null),
        new Optionable(
          { errorThrownFromTheFunction: new Optionable(new CustomError(err.message)) }
        )) 
    }
  }

handlerErrors(handlers: Record<keyof E, (e: ICustomError) => void>): void {
  if (isEmptyObject(handlers) && this.safeMode) {
    console.log("note passing empty error handler to handleErrors means you have not defined any possible errors that the Result could  result to are you sure using a result here is neccessary?, if you think you know what are you doing extend the class into your custom result and overwrite the safe method protected variablle to true, (i make you to make a whole new class to give you time to really think if you understand what you are doing)")
    return
  }
  this.error.ifCanBeUnpacked((v) => {
    Object.keys(v).forEach((key) => {
      const handler = handlers[key as keyof E]; // Ensure correct typing
      if (handler) {
        v[key].ifCanBeUnpacked((error) => handler(error))
      }
    });
  });
}

}

export class ConcreteResult<T> extends Result<T, Errors> {}









// ---------------------
