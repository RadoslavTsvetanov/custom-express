import type { AiResponse } from "~/services/questionSender/types";
import type { ModelSettings } from "./types";
import type { Optionable } from "@custom-express/better-standard-library";


export interface IModelsRepo {

    getModels(): ModelSettings[]
    getModelInfo(modelName: string): ModelSettings 

    addNewModelInfo(v: ModelSettings): void 
}


class ModelsRepo implements IModelsRepo{
    getModelInfo(modeName: string): Optionable<ModelSettings>{
        return {

        }
    }

    getModels(): ModelSettings[] {
        
    }

    addNewModelInfo(v: ModelSettings){

    }
}

export const modelsRepo = new ModelsRepo()