import { UseState } from "@custom-express/frontend-thingies";
import { ModeSelector, type ModeType } from "./editor";
import { OneOf } from "@custom-express/better-standard-library";
import { useEffect, type FC } from "react";
import { Dropdown, OptionsSelector } from "./dropdown";

interface QuestionInputProps {
  onNewQuestion: (v: {
    question: string;
    currentModel: string | string[];
  }) => Promise<void>;
}

class CurrentModel extends OneOf.Instance<{
  one: {
    type: "one";
    data: string;
  };
  batch: {
    type: "batch";
    data: string[];
  };
}>{}


export const QuestionInput: FC<QuestionInputProps> = ({ onNewQuestion }) => {
  const state = {
    currentModel: UseState<string | string[]>("chatgpt"), //TODO: refactor to use oneOf,
    question: UseState(""),
    mode: UseState("single" as ModeType),
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        if (state.question.value.trim() !== "") {
          onNewQuestion({
            question: state.question.value.trim(),
            currentModel: state.currentModel.value,
          })
          .then(v => {})
          .catch(v => {})
          state.question.set("");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.question.value, state.question, onNewQuestion, state.currentModel.value]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.question.value.trim() !== "") {
          onNewQuestion({
            question: state.question.value.trim(),
            currentModel: state.currentModel.value,
          })
          .then(v => {})
          .catch(v => {})
      state.question.set("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        {state.mode.value === "single" ? (
          <div>
            <Dropdown options={["chat", "h"]} current={state.currentModel} />
          </div>
        ) : (
          <div>
            <OptionsSelector
              current={JSON.stringify(state.currentModel.value)}
              options={["", "chatgpt", "h"]}
              onChange={(e) =>
                state.currentModel.set((prev) => {
                  let newState: string[];

                  if (typeof prev === "string") {
                    newState = [state.currentModel.value];
                  } else {
                    newState = [...prev];
                  }

                  newState.push(e.target.value);
                  return newState;
                })
              }
            />
          </div>
        )}
      </div>
      <ModeSelector mode={state.mode} />
      <input
        type="text"
        value={state.question.value}
        onChange={(e) => state.question.set(e.target.value)}
        placeholder="Ask your question"
      />
      <button type="submit">Submit</button>
    </form>
  );
};