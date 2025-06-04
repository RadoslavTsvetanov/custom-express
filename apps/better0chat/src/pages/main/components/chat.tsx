/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";

import { Card, CardContent } from "~/components/ui/card";

import { QuestionInput } from "./questionInput";

export type ChatState = {
    chats: { messages: ChatProps["messages"] }[];
};
export type ChatMessage = {
    message: React.ReactNode;
    isUser: boolean;
};

export type ChatProps = {
    messages: ChatMessage[];
    onNewQuestion: (v: {
        question: string;
        currentModel: string | string[];
    }) => Promise<void>;
};
export function Chat({ messages, onNewQuestion }: ChatProps) {
    return (
        <div className="mx-auto w-full max-w-md space-y-2 overflow-scroll">
            {messages.map((msg, index) => (
                <Card
                    key={index}
                    className={`${
                        msg.isUser
                            ? "ml-auto bg-blue-500 text-white"
                            : "mr-auto bg-gray-100 text-black"
                    } w-fit max-w-xs rounded-2xl px-4 py-2 shadow-md`}
                >
                    <CardContent className="p-0">{msg.message}</CardContent>
                </Card>
            ))}
            <QuestionInput onNewQuestion={onNewQuestion} />
        </div>
    );
}
