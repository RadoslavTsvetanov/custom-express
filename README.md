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
## better type safety

Although that is bot a fault of express we have added better type safety around some common things you need when making apis

Things that need to be done: custom type validation: see zod and zod-express for refernce and also how to do it with classes
\
## built in file handler
since by default express does not have a file processing capabilities we have set up one (pur choise is [multer](https://www.npmjs.com/package/multer))

# Express plug and play
We have essentially made some heplful wrappers around express but at the core an app is just an `express Router` so if you have an existing express server and you dont want to rewrite you can just do the follwong 



```ts
// your exusting express code

const app2 = new WebServer()

app.use(app2.getRouter())
```
