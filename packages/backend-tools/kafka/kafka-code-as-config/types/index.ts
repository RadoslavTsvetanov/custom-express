import type { ZodObject, ZodRawShape } from "zod"

export type DefaultZodObject = ZodObject<ZodRawShape>

export type Message<T extends DefaultZodObject> = {
    data: T
}

export type DefaultMessage = Message<DefaultZodObject>

export type Channel<T extends Record<string, DefaultMessage>> = T 

export type DefaultChannel = Channel<Record<string, DefaultMessage>>

export type ChannelsDefault =  Record<string, DefaultChannel>

