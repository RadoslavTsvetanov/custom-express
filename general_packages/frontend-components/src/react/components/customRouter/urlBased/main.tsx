
import { match } from "path-to-regexp";



export type RouteDefinition<Path extends string> = {
  path: Path;
  component: React.FC<{ params: ExtractParams<Path> }>;
};

type Routes = readonly RouteDefinition<string>[]  


export function createRoute<Path extends string>(v: RouteDefinition<Path>) {
    return v
}

type Props<T extends Routes> = {
  currentUrl: string;
  routes: T;
};

export const NavigationBar = <T extends Routes>({
  currentUrl,
  routes,
}: Props<T>) => {
  for (const { path, component: Component } of routes) {
    const matcher = match<ExtractParam<typeof path>>(path, {
      decode: decodeURIComponent,
    });
    const matched = matcher(currentUrl);
    if (matched) {
      return (
        <nav>
          <Component params={matched.params} />
        </nav>
      );
    }
  }

  return <div>404: Not Found</div>;
};







