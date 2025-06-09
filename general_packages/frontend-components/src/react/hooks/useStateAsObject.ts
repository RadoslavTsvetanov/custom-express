import React, { useState } from "react";


export type State<StateType> =  {
    value: StateType,
    get: () => StateType
    set: React.Dispatch<React.SetStateAction<StateType>>
}

export function UseState<StateType>(data: StateType): State<StateType> {
    const [state, setState] = useState(data)
    return {
        get: () => state,
        value: state,
        set: setState
    }
}