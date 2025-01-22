# custom-express


# Features 
- openapi generation using just ts syntax and express route defining paradigm
Example (pseudo ts)
- req validation like in fastapi
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
