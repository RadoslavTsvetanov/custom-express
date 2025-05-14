import Head from "next/head";
import Link from "next/link";
import {CommandPalette, SimpleCommandPrompt, InternetChecker} from "@custom-express/frontend-thingies"
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <InternetChecker ifOffline={() => <div>no internet, changes you perform are saved loccaly and will be synced when you are online </div>}>
    <SimpleCommandPrompt/>
    </InternetChecker>
    </>
  );
}
