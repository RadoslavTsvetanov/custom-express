import { ifNotNone } from "../errors-as-values/src/rust-like-pattern/option"
import { valuesOf } from "../metaprogramming/valuesOf"
import { UnknownRecord } from "../types/unknwonString"

export namespace OneOf {


  export type One<K extends keyof UnknownRecord> = { type: K, d: UnknownRecord[K] }

  type Handlers<T extends UnknownRecord> = {
    [K in keyof T]?: (v: { type: K, d: T[K] }) => Promise<void>
  }

  export class Instance<T extends UnknownRecord> {
    private value: valuesOf<T>
    private handlers: Handlers<T> = {}

    constructor(v: valuesOf<T>, handlers?: Handlers<T>) {
      this.value = v
      ifNotNone(handlers, h => this.handlers = h)
    }

    if<K extends keyof T>(config: {
      v: K,
      handler: (v: { type: K, d: T[K] }) => Promise<void>
    }):// K extends keyof Handlers<T> 
    // ? 
    // never // since handler is laready defined in this case
    // :   
    Instance<T> {
      return new Instance(this.value, {
        ...this.handlers,
        [config.v]: config.handler
      })
    }

    async run() {
      const handler = this.handlers[this.value] as ((v: typeof this.value) => Promise<void>) | undefined
      if (handler) {
        await handler(this.value)
      }
    }

    async def(v: Handlers<T>){
      
    }
  }

}

new OneOf.Instance<{
    jiji: {koko: string},
    jojo: {jiji: number}
}>({jiji: 1})
.if({
    v: "jiji",
    handler: async v => {v.d.koko}
})
.if({
    v: "jojo",
    handler: async v => {v.d.jiji}
})
.run()