import type { FC } from "react";

import { UseState } from "@custom-express/frontend-thingies";

export const Menu: FC = () => {
    const chats = UseState<{ title: string }[]>([]);
    // should be gotten from index db
    return (
        <div>
            <h1>Menu</h1>
            <button onClick={() => {}}>new </button>
            {chats.value.map(chat => (
                <div>{chat.title}</div>
            ))}
        </div>
    );
};
