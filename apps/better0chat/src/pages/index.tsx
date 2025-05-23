import Head from "next/head";
import Link from "next/link";
// import {CommandPalette, SimpleCommandPrompt, InternetChecker} from "@custom-express/frontend-thingies"
import { api } from "~/utils/api";
import { , Editor, PaneInstance, type EditorState as EditorStateType } from "~/components/custom/editor";
import { useEffect, useState } from "react";
import { OneOf } from "@custom-express/better-standard-library";
import type { ChatProps } from "~/components/custom/chat";

type ChatState = {
  chats: ChatProps[]
} 


export default function Home() {

  const ChatState = useState<ChatState>({
    chats: []
  })
  useEffect(() => {

    window.addEventListener('keydown', (event) => {

      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        console.log('Ctrl + / pressed!');
        // Your logic here
      }
    });
  }, []);


  const [state, setState] = useState<EditorStateType>({
    pane: new PaneInstance({
      type: "split",
      splitType: "vertical",
      dimensions: [30, 70],
      buffers: [
        new PaneInstance({
          type: "split",
          splitType: "horizontal",
          dimensions: [50, 50],
          buffers: [
            new PaneInstance({
              type: "content",
              content: 
            }),
            new PaneInstance({
              type: "split",
              splitType: "vertical",
              dimensions: [60, 40],
              buffers: [
                new PaneInstance({
                  type: "content",
                  content: "Middle Left Panel"
                }),
                new PaneInstance({
                  type: "content",
                  content: "Middle Right Panel"
                })
              ]
            })
          ]
        }),
        new PaneInstance({
          type: "split",
          splitType: "horizontal",
          dimensions: [25, 75],
          buffers: [
            new PaneInstance({
              type: "split",
              splitType: "vertical",
              dimensions: [50, 50],
              buffers: [
                new PaneInstance({
                  type: "content",
                  content: "Top Right Left"
                }),
                new PaneInstance({
                  type: "split",
                  splitType: "horizontal",
                  dimensions: [60, 40],
                  buffers: [
                    new PaneInstance({
                      type: "content",
                      content: "Top Right Right Top"
                    }),
                    new PaneInstance({
                      type: "content",
                      content: "Top Right Right Bottom"
                    })
                  ]
                })
              ]
            }),
            new PaneInstance({
              type: "split",
              splitType: "vertical",            
              dimensions: [70, 30],
              buffers: [
                new PaneInstance({
                  type: "content",
                  content: "Bottom Right Left"
                }),
                new PaneInstance({
                  type: "content",
                  content: "Bottom Right Right"
                })
              ]
            })
          ]
        })
      ]
    })
    
  });
  return (
    <>
      {/* <InternetChecker ifOffline={() => <div>no internet, changes you perform are saved loccaly and will be synced when you are online </div>}> */}
    {/* <SimpleCommandPrompt/> */}
    {/* </InternetChecker> */}
    <Editor state={{
      state,
      setState
    }}/>
    </>
  );
}
