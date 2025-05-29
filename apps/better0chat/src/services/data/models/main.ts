import type { Optionable } from '@custom-express/better-standard-library'

import type { ModelSettings } from './types'

export type IModelsRepo = {

  getModels: () => ModelSettings[]
  getModelInfo: (modelName: string) => ModelSettings

  addNewModelInfo: (v: ModelSettings) => void
}

class ModelsRepo implements IModelsRepo {
  getModelInfo(modeName: string): Optionable<ModelSettings> {
    return {

    }
  }

  getModels(): ModelSettings[] {

  }

  addNewModelInfo(v: ModelSettings) {

  }
}

export const modelsRepo = new ModelsRepo()
