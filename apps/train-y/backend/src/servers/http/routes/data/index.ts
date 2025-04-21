import Elysia, { t } from "elysia";
import { DataService } from "../../../../modules/services/data/implementations/main";
import { ITimeSeriesService } from "../../../../modules/services/data/interface";

function provideContext(): {
  services: {data: ITimeSeriesService };
} {
  return {};
}

export const data = new Elysia({ prefix: "/analytics" })
    .state(provideContext())
    .get(
        "/:line/:transport",
        async ({store, query, params}) => {
            return await store.services.data.getEntriesDuring({
                ...query
            })
        },
        {
            query: t.Object({
                start: t.Date({default: Date.now() - 1000}), // the last 10 days
                end: t.Date({default: Date.now()}) // the last 10 days
            }),
        }
    )