import type React from "react";

import { useState } from "react";

export const BatchResponse: React.FC<{ responses: React.ReactNode[] }> = ({
    responses,
}) => {
    const [current, setCurrent] = useState(0);
    return (
        <div className="flex">
            <button
                onClick={() => {
                    if (current <= 0) {
                        setCurrent(responses.length - 1);
                        return;
                    }
                    setCurrent(current - 1);
                }}
            >
                {"<"}
            </button>
            {responses[current]}
            <button
                onClick={() => {
                    if (current + 1 >= responses.length) {
                        setCurrent(0);
                        return;
                    }
                    setCurrent(current + 1);
                }}
            >
                {">"}
            </button>
        </div>
    );
};
