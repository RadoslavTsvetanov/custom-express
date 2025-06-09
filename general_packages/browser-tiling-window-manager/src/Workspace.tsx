import type { valuesOf } from "@blazyts/better-standard-library/src/metaprogramming/valuesOf";
import type { State } from "@blazyts/frontend-thingies/src/react/hooks/useStateAsObject";

import { OneOf, Try } from "@blazyts/better-standard-library";
import React from "react";

export type SplitType = "horizontal" | "vertical";

export type Pane = OneOf.Instance<{
  split: {
    dimensions: [number, number];
    buffers: [Pane, Pane];
    splitType: SplitType;
    type: "split";
  };
  content: {
    type: "content";
    content: React.ReactNode;
  };
}>;

export class PaneInstance extends OneOf.Instance<Pane["schema"]> {
  constructor(v: valuesOf<Pane["schema"]>) {
    super(v);
  }
}

export type EditorState = {
  pane: Pane;
};

export type ReactState<T> = {
  state: T;
  setState: (state: T) => void;
};

export type ModeType = "single" | "batch"; // Refactor to be OneOf

export const ModeSelector: React.FC<{ mode: State<ModeType> }> = ({ mode }) => {
  const runModeAction = (mode: ModeType) => {
    if (mode === "single") {
      console.log("Switched to single mode");
      // Add your single mode logic here
    } else {
      console.log("Switched to batch mode");
      // Add your batch mode logic here
    }
  };

  const onChange = (value: string) => {
    mode.set(value as "single" | "batch");
    runModeAction(value as "single" | "batch");
  };

  return (
    <div role="radiogroup" aria-label="Mode" className="flex space-x-6">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="single"
          name="mode"
          value="single"
          checked={mode.value === "single"}
          onChange={() => onChange("single")}
          className="cursor-pointer"
        />
        <label
          htmlFor="single"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Single
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="batch"
          name="mode"
          value="batch"
          checked={mode.value === "batch"}
          onChange={() => onChange("batch")}
          className="cursor-pointer"
        />
        <label
          htmlFor="batch"
          className="text-sm font-medium cursor-pointer select-none"
        >
          Batch
        </label>
      </div>
    </div>
  );
};

export const Pane: React.FC<{ pane: Pane }> = ({ pane }) => {
  return (
    <div className="h-full w-full">
      {pane.def({
        content: (v) => (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 border">
            {v.content}
          </div>
        ),

        split: (v) => {
          const isHorizontal = v.splitType === "horizontal";

          if (isHorizontal) {
            // Horizontal split = side-by-side = grid-cols
            return (
              <div
                className="grid h-full w-full"
                style={{
                  gridTemplateColumns: `${v.dimensions[0]}% auto ${v.dimensions[1]}%`,
                }}
              >
                <div className="w-full h-full overflow-hidden">
                  <Pane pane={v.buffers[0]} />
                </div>

                {/* Divider */}
                <div className="w-2 cursor-col-resize bg-amber-300" />

                <div className="w-full h-full overflow-hidden">
                  <Pane pane={v.buffers[1]} />
                </div>
              </div>
            );
          } else {
            // Vertical split = stacked top to bottom = grid-rows
            return (
              <div
                className="grid h-full w-full"
                style={{
                  gridTemplateRows: `${v.dimensions[0]}% auto ${v.dimensions[1]}%`,
                }}
              >
                <div className="w-full h-full overflow-hidden">
                  <Pane pane={v.buffers[0]} />
                </div>

                {/* Divider */}
                <div className="h-2 cursor-row-resize bg-blue-300" />

                <div className="w-full h-full overflow-hidden">
                  <Pane pane={v.buffers[1]} />
                </div>
              </div>
            );
          }
        },
      }) ?? <div>Default fallback — bug rendering pane</div>}
    </div>
  );
};

export const Editor: React.FC<{
  state: ReactState<EditorState>;
  containerStyles?: string;
}> = ({ state, containerStyles }) => {
  return (
    <div
      className={Try(containerStyles, {
        ifNone: () => "h-[100vh] w-full",
        ifNotNone: (v) => v,
      })}
    >
      <Pane pane={state.state.pane} />
    </div>
  );
};
