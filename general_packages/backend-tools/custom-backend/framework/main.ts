import { app } from "../lib";

export class EnchancedApp extends  app<{},[] > {
    constructor() {
        super({})
        this.imutify();
        this.hook(ctx => console.log(ctx))
    }
}