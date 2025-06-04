import { SimpleResult } from "@custom-express/better-standard-library";

import type { AiResponse } from "./types";

import { modelsRepo } from "../data/models/main";

export function askAi(prompt: string, modelName: string): Promise<SimpleResult<
    AiResponse,
    {
        notFound: {
            ok: false;
            type: "notFound";
            message: string;
            value: string;
        };
    }
>> {
    if (modelsRepo.getModelInfo(modelName).is_none()) {
        return new SimpleResult();
    }
}
