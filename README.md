# custom-express


# Features 
## openapi generation using just ts syntax and express route defining paradigm
Example (pseudo ts)
## req validation like in fastapi
```ts

  app.get(  
  "/users/:id",
  { 
    id: (v) => {return v.trim()} // custom handler
    id 
  },
  () => {
})


```


Things that need to be done: custom type validation: see zod for refernce and also how to do it with classes
\


# Express plug and play
We have essentially made some heplful wrappers around express but at the core an app is just an `express Router` so if you have an existing express server and you dont want to rewrite you can just do the follwong 



```ts
// your exusting express code

const app2 = new WebServer()

app.use(app2.getRouter())
```
