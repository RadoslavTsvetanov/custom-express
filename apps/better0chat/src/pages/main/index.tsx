import { map } from "@custom-express/better-standard-library";
import { UseState } from "@custom-express/frontend-thingies";
import { Menu } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ChatState } from "~/pages/main/components/chat";
import * as TWM from "@custom-express/browser-tiling-window-manager"
import { Switcher } from "~/components/custom/switcher";
import { BatchResponse } from "~/pages/main/components/batchResponse";
import { Chat } from "~/pages/main/components/chat";

// ---
// Menu
// ---

const keys = ["Ctrl", 1, 2, 3, 4, 5, 6, 7, 8, 9, "a", "b", "s"] as const;

function subscribeToKeyboardClick(keyCombination: (typeof keys)[number][]) {}

export default function Home() {
    const state = {
        workspace: UseState(1),
        chat: UseState<ChatState>({
            chats: [
                { messages: [{ message: "string", isUser: false }] },
                { messages: [{ message: "string", isUser: false }] },
            ],
        }),
        editor: UseState<TWM.EditorState>({
            pane: new TWM.PaneInstance({ type: "content", content: "" }),
        }),
    };

    const chatStateRef = useRef(state.chat.value);
    useEffect(() => {
        chatStateRef.current = state.chat.value;
    }, [state.chat.value]);

    useEffect(() => {
        console.log(432);
    }, [state.workspace.value]);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "/") {
                event.preventDefault();
                console.log("Ctrl + / pressed!");
            }

            map(Number.parseInt(event.key), (k) => {
                if ((event.ctrlKey || event.metaKey) && k > 0 && k < 10) {
                    console.log(444);
                    event.preventDefault();
                    state.workspace.set(k);
                }
            });
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const workspaces = [];



    return (
        <div className="flex flex-auto">
            <Menu />
            <Switcher
                components={[
                    <TWM.TilingWindowEditor
                        key={0}
                        chatState={state.chat.value}
                        setChatState={state.chat.set}
                        editorState={state.editor.value}
                        setEditorState={state.editor.set}
                    />,
                ]}
                currentComponent={state.workspace.value - 1}
            />
        </div>
    );
}
