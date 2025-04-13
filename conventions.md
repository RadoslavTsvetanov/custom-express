# TS conventions

For the most part we are using the default conventions from the official ts conventions any changes are listed below


# underscore public`s that shouldnt be public 

for example if for debug purposes you need to make a variable public you dont need to directly remove it from the codebase before commit instead prefix it with underscore 

```ts
class SomeService {
  private internalState: number = 42;

  public _devInternalState?: number;

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this._devInternalState = this.internalState;
    }
  }

  doSomething() {
    // logic here...
  }
}

```