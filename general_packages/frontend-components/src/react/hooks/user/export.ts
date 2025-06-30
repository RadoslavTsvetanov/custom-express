import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { Optionable } from "@blazyts/better-standard-library"
// general extendable interface
function createUserHooks<User>(savingStrategy: {
    save: (u : User) => void 
    invalidate: () => void
}): {
    save: (u: User) => void
    get: () => Optionable<User>
    invalidate: () => void
} {
    const [user, setUser] = useState<Optionable<User>>(Optionable(null))
    return {
        save: (u: User) => {
            savingStrategy.save(u)
            setUser(new Optionable(u))
        },
        get: () => user,
        invalidate: () => savingStrategy.invalidate()
    }
}

export function createCookieUserHooks<User>() {
    const [user, setUser] = useState<Optionable<User>>(new Optionable(null))
    return {
        get: () => {
            useEffect(() => { 
                    const user = Cookies.get("user")
                    if (user) {
                        setUser(JSON.parse(user))
                    }
            })
            return 
        },
        save: (u: User) => {
            Cookies.set("user", JSON.stringify(u))
            setUser(new Optionable(u))
        },
        invalidate: () => {
            Cookies.remove("user")
            setUser(new Optionable(null))
        }
    }
}