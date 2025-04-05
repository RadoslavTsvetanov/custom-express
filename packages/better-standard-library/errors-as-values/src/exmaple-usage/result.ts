/*


Example usage


Lets say we have a function which validates a certain input which if it finds something is not valid throws an error with the reason and if returned we want to do something with the value 

So we will have something like that

```ts
function validateInput(v: string) {
    if (v.length === 0) {
        throw new Error("lenght cant be 0")
    }

    return v
}

() => {
    try {
       validateInput("foo") 
    } catch (e) {
        console.log(e)
    }
}
```



where is the problem here? -> well the compiler does not warn us that something could go wronh which is a bad thing in geenral it is a good idea to offest as much work to the compiler ass possible in terms of things we need to keep in context so here is the apporach using result  
*/

import { Optionable } from "../rust-like-pattern/option"
import { ConcreteResult, CustomError, Result, type ICustomError } from "../rust-like-pattern/result"


function validateInput(v: string): Result<string, {inputTooSmall: Optionable<ICustomError>}> {
    if (v.length === 0) {
        return new Result(new Optionable<string>(null), new Optionable({ inputTooSmall: new Optionable(new CustomError("length cant be zero")) }))
    }

    return new Result(new Optionable(v), new Optionable<{inputTooSmall: Optionable<ICustomError>}>(null))
}

() => {
    const foo = validateInput("foo")
    // foo.toUppercase() // results in a compilation error since it is not if type string and we need to explicitely check

    foo.unpack().toUpperCase() // we are aware that this could resove in an error 
}