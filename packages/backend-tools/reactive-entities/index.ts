import type { URecord } from "@custom-express/better-standard-library";

type Entities<T extends Record<string, {

}>> = T;
type EntitiesDefault = Entities<Record<string, EntityDefault>>;
export class EntitiesServer<E extends EntitiesDefault> {
    private entites: E;

    private overloads: URecord;

    constructor(v: E) {
        this.entites = v;
    }

    connect<AnotherEntity extends EntitiesDefault>(v: {
        [K in keyof AnotherEntity]?: (service: E, connected: AnotherEntity) => void
    }) {

    }
}

const a = new EntitiesServer({
    hi: {
        koko: (v) => {},
    },
});
