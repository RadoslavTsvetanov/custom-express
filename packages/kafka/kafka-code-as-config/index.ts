import { z, type ZodObject, type ZodRawShape } from "zod"

type DefaultZodObject = ZodObject<ZodRawShape>

type Message<T extends DefaultZodObject> = {
    data: T
}

type DefaultMessage = Message<DefaultZodObject>

type Channel<T extends Record<string, DefaultMessage>> = T 

type DefaultChannel = Channel<Record<string, DefaultMessage>>

type Channels =  Record<string, DefaultChannel>

class KafkaClient<Topics extends Channels> {
    constructor() { }
    private messageConfig: {[Topic in keyof Topics] ?: (v: Topics[Topic]) => Promise<void>} 
    addListener<Topic extends keyof Channels>(topic: Topic, config: (v: Channels[Topic]) => Promise<void>) {

    }

    run()
}

class KafkaConfig<Channels extends > {
    private channels: Channels 
    constructor(channels: Channels) {
        this.channels = channels 
    }
    public get channel(): Channels {
        return this.channels
    }
    generateSubscriber(): {}

    generatePublisher(){}
}



const g = new KafkaConfig({
    data: {
        newData: {
            data: z.object({
                f: z.string()
            })
        }
    }
})
