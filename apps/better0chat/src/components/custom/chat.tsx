import React from "react"
import { Card, CardContent } from "~/components/ui/card"

export type ChatMessage = {
  message: string
  isUser: boolean
}

export type ChatProps = {
  messages: ChatMessage[]
}

export default function Chat({ messages }: ChatProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {messages.map((msg, index) => (
        <Card
          key={index}
          className={`${
            msg.isUser ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-black mr-auto"
          } w-fit max-w-xs rounded-2xl px-4 py-2 shadow-md`}
        >
          <CardContent className="p-0">{msg.message}</CardContent>
        </Card>
      ))}
    </div>
  )
}
