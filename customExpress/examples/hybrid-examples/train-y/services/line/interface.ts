import type { timeQuery } from "../../types/timeQuery";

type LineDataInPointOfTime = {}

interface ILine {
    getLineData(timeQuery: timeQuery): LineDataInPointOfTime[] 
}

