import { map } from '@custom-express/better-standard-library'
import { UseState } from '@custom-express/frontend-thingies'
import { Menu } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ChatState } from '~/pages/main/components/chat'
import type { EditorState as EditorStateType } from '~/pages/main/components/editor'

import { Switcher } from '~/components/custom/switcher'
import { BatchResponse } from '~/pages/main/components/batchResponse'
import { Chat } from '~/pages/main/components/chat'
import {
  Editor,

  PaneInstance,
} from '~/pages/main/components/editor'
// ---
// Menu
// ---

const keys = ['Ctrl', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 's'] as const

function subscribeToKeyboardClick(keyCombination: (typeof keys)[number][]) {}

export default function Home() {
  const state = {
    workspace: UseState(1),
    chat: UseState<ChatState>({
      chats: [
        { messages: [{ message: 'string', isUser: false }] },
        { messages: [{ message: 'string', isUser: false }] },
      ],
    }),
    editor: UseState<EditorStateType>({
      pane: new PaneInstance({ type: 'content', content: '' }),
    }),
  }

  const chatStateRef = useRef(state.chat.value)
  useEffect(() => {
    chatStateRef.current = state.chat.value
  }, [state.chat.value])

  useEffect(() => {
    console.log(432)
  }, [state.workspace.value])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        console.log('Ctrl + / pressed!')
      }

      map(Number.parseInt(event.key), (k) => {
        if ((event.ctrlKey || event.metaKey) && k > 0 && k < 10) {
          console.log(444)
          event.preventDefault()
          state.workspace.set(k)
        }
      })
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const workspaces = []

  const pane = new PaneInstance({
    type: 'split',
    splitType: 'horizontal',
    dimensions: [50, 50],
    buffers: [
      new PaneInstance({
        type: 'content',
        content: (
          <Chat
            messages={state.chat.value.chats[0]?.messages ?? []}
            onNewQuestion={async ({ question, currentModel }) => {
              state.chat.set((prev) => {
                const newChats = [...prev.chats]
                newChats[0] = {
                  messages: [
                    ...newChats[0].messages,
                    { message: question, isUser: true },
                    {
                      message: (typeof currentModel === 'string')
                        ? 'hihi'
                        : <BatchResponse responses={[<div>f</div>, 'jiji']} />,
                      isUser: false,
                    },
                  ],
                }
                return { chats: newChats }
              })
            }}
          />
        ),
      }),
      new PaneInstance({
        type: 'content',
        content: <Chat messages={state.chat.value.chats[1]?.messages ?? []} />,
      }),
    ],
  })

  return (
    <div className="flex flex-auto">
      <Menu />
      <Switcher
        components={[
          <Editor
            key={0}
            state={{
              state: { pane },
              setState: state.editor.set,
            }}
          />,
        ]}
        currentComponent={state.workspace.value - 1}
      />
    </div>
  )
}
