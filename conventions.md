# TS conventions

For the most part we are using the default conventions from the official ts conventions any changes are listed below

# underscore public`s that shouldnt be public

for example if for debug purposes you need to make a variable public (note that for it to be only 1 underscore it should be needed by default and not just created for debug) you dont need to directly remove it from the codebase before commit instead prefix it with underscore

this is mainly for directly exposing memebrs of classes so that you can observe the state instead of needing to make a getter and setter

```ts
class SomeService {
    private internalState: number = 42;

    public _devInternalState?: number;

    constructor() {
        if (process.env.NODE_ENV === "development") {
            this._devInternalState = this.internalState;
        }
    }

    doSomething() {
    // logic here...
    }
}
```

# double underscore things that are there only for debug purposes and should be deleted

for example you expose a method which serves as a debug utility

```ts
import { OrderedRecord } from "@blazyts/better-standard-library";

import { HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import { MessageHandler } from "../../../types/Message/main";
import { HookBuilder } from "./HookBuilder";

export class MessageThatCanBeReceivedBuilder<
    Context,
    BeforeHooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    MsgHandler extends MessageHandler<BeforeHooks["lastElement"], unknown, BeforeHooks>
> {
    public _message: MsgHandler;
    public _hooks: BeforeHooks;
    public __l: BeforeHooks; // server no real purpose outside of provding a quick way to observer some state for pure debug purposes
    constructor(name: string, hooks: BeforeHooks, handler: ReturnType<MsgHandler["handler"]>) {

    }

    addHook();

    createHookBuilder();
}

const hooks = HookBuilder
    .new() // using new is the reccomended way since it is a cleaner although
    .add({ key: "ok", execute: v => "" } as const)
    .add({ key: "hohoh", execute: (v) => { return {} as const; } } as const)
    .build();

{

}

{
    const newMsg = new MessageThatCanBeReceivedBuilder(
        "hi",

        hooks,
        (v) => {}
    );

    {
        const g = newMsg.__l.elements.value[0];
    }
}
```

# Debug logging

For your and any other contributer sanity if you are gonna be using console.log for debugging please use logger.debug, it behaves one to one like consol.log but it tells pther peole that this is meant for debug purposes
