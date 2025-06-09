import { createRoute, NavigationBar } from "./main"

const PageRoutable = () => {
    <NavigationBar
        currentUrl="/:koko"
        routes={
            [
                createRoute({path: "/:ko" as const,component: v => v.params.ko}), // as const 
                createRoute({path: "/:jiji" as const, component: v => v.params.jiji})
            ]
        }
    />
}