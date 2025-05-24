import { useEffect, type FC } from "react"
import { Card, CardContent } from "~/components/ui/card"
import {ModeSelector, type ModeType} from "./editor"
import { UseState } from "@custom-express/frontend-thingies"
import { OneOf } from "@custom-express/better-standard-library"
import React, { useState } from 'react';
import type { State } from "@custom-express/frontend-thingies/src/react/hooks/useStateAsObject"

export type ChatMessage = {
  message: React.ReactNode
  isUser: boolean
}

export type ChatProps = {
  messages: ChatMessage[],
  onNewQuestion: (v: {question: string, currentModel: string | string[]}) => Promise<void>
}

interface QuestionInputProps {
    onNewQuestion: (question: string) => void;
  }


class CurrentModel extends OneOf.Instance<{
  one: {
    type: "one"
    data: string
  },
  batch: {
    type: "batch",
    data: string[]
  }
}>{}

const QuestionInput: FC<QuestionInputProps> = ({ onNewQuestion }) => {
    const [question, setQuestion] = useState<string>('');
    const mode = UseState<ModeType>('single')

    const state = {
      currentModel: UseState<string | string[]>("chatgpt") //TODO: refactor to use oneOf
    }

    useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
          event.preventDefault();
          if (question.trim() !== '') {
            onNewQuestion({question:  question.trim()});
            setQuestion('');
          }
        }
      }
  
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [question, onNewQuestion]);
  
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (question.trim() !== '') {
        onNewQuestion(question.trim());
        setQuestion('');
      }
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          {
            mode.value === "single"
              ? <div>
                <Dropdown options={["chat", "h"]} current={state.currentModel}/>
              </div>
              : <div>
                <OptionsSelector 
                current={JSON.stringify(state.currentModel.value)} 
                options={["","chatgpt", "h"]} 
                onChange={e => state.currentModel.set(
                  prev => {
                    let newState: string[];

                    if (typeof prev === "string") {
                      newState = [state.currentModel.value];
                    } else {
                      newState = [...prev];
                    }

                    newState.push(e.target.value);
                    return newState;

                  }
                )}/>
              </div>
          }
        </div>
        <ModeSelector mode={mode}/>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask your question"
        />
        <button type="submit">Submit</button>
      </form>
    );
  };
export default function Chat({ messages, onNewQuestion }: ChatProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-2 overflow-scroll">
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
      <QuestionInput onNewQuestion={onNewQuestion}/>
    </div>
  )
}



// ---




export const Dropdown: React.FC<({ options: string[], current: State<string> })> = ({current, options}) => {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    current.set(e.target.value);
  };

  return (
    <div>
      <select value={current.value} onChange={handleChange}>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p>Selected: {current.value}</p>
    </div>
  );
}

export const OptionsSelector: React.FC<{options: string[], current: React.ReactNode, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void}> = ({current, options, onChange}) => {
  return <div>
    <select value="" onChange={onChange}> 
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select> 
    {current}
  </div>
}