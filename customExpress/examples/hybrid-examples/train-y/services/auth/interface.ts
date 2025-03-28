import type { id } from "../../types/id"

export interface IAuth {
    //Intended behaviour if the token does not exist return false to simplify working with this  service
    isUserAlreadyConnected(token: string): Promise<boolean>
    grantToken(userId: id): Promise<string>
}