export class Server<Methods extends Record<string, unknown>> {
    public v: Methods;
    constructor(v: Methods) {
        this.v = v;
    }

    addEntity<V extends EntityBuilder<URecord>, Name extends string>(e: {
        service: V;
        name: Name;
    }) {
        return new Server<Methods & { [K in Name]: V }>({
            ...this.v,
            [e.name]: e.service,
        } as const);
    }

    getflat();
}
