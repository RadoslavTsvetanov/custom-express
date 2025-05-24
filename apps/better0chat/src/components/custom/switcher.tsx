import type React from "react";

export const Switcher: React.FC<{components: React.ReactNode[], currentComponent: number}> = ({ components, currentComponent }) => {
    const Cur = components[currentComponent]
    return <div>
        {Cur}
    </div>
}