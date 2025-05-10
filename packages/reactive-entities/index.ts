type Entity<T extends Record<string, Function>> = T
type EntityDefault = Entity<Record<string, Function>>
type Entities<T extends Record<string, EntityDefault>> = T
type EntitesDefault = 
class EntitiesServer<E extends Entities<>> {
    private entites: 
    constructor()
}