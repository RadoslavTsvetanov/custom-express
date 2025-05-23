import { useState } from "react";

import { map, OneOf, tap } from "@custom-express/better-standard-library";
import type { valuesOf } from "@custom-express/better-standard-library/src/metaprogramming/valuesOf";

type SplitType = "horizontal" | "vertical";







 
type Pane = OneOf.Instance<{
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

export const Pane: React.FC<{ pane: Pane }> = ({ pane }) => {
  return (
    <div className="h-full w-full">
      {pane
      .def({

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

export const Editor: React.FC<{ state: ReactState<EditorState> }> = ({ state }) => {
  return (
    <div className="h-[100vh] w-full">
      <Pane pane={state.state.pane} />
    </div>
  );
};
