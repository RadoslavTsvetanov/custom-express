import { Port } from "../../../../src/types/networking/port";
import type { IAuth } from "../services/auth/interface";
import type { ITrain } from "../services/train/interface";
import type { IUser } from "../services/user/interface";
import { defintion } from "./definition";

defintion
    .store<{
        services: {
            user: IUser
            auth: IAuth,
            train: ITrain
        }
    }>({

    })
    .implement({
        onConnection: v => {

        },
        beforeMessage: v => {
            console.log(`
                Log
                
                ${JSON.stringify(v.message)}
                
                `)
        },
        train: {
            newTrainData: ({ data, store }) => {
                store.services.train.addData(
                    data.id,
                    {
                        timestamp: data.timestamp,
                        location: data.location,
                        data: {
                            ...data
                        }
                    }
                )
            }
        },
        passanger: {
            newPassangerData: ({ store, data }) => {
                store.services.user.addData(
                    data.id,
                    {
                        ...data, // a bit strange refactor to make it more readable 
                        data: {
                            ...data
                        }
                    }
                ) 
            }
        }
    })

console.log(defintion.handlers)
defintion.start(new Port(4444))