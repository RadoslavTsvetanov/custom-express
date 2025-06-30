import * as Pipeable from "@better-standard-internal/data_structures/Pipe/export";
import * as Tickable from "@better-standard-internal/data_structures/tick/export";
import * as Mapable from "@better-standard-internal/data_structures/map/export";

interface BaseValue<V> extends Pipeable.types.IPipeable<V>, Tickable.types.Tick<V>, Mapable.types.Mapable<V> {
    
}