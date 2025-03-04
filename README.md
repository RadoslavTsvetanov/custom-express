# custom-express


# Features 
## openapi generation using just ts syntax and express route defining paradigm
Example (pseudo ts)
## req validation like in fastapi
```ts

  app.get(  
  "/users/:id",
  {
    body: z.object({}),
    params: z.object({}),
    response: z.object({})
  }
  () => {

...

}


)


```
## better type safety

Although that is bot a fault of express we have added better type safety around some common things you need when making apis
# safe envs 
we have added a package which provides a type safe way to refrnce envs and also enables you to define custom getters


# Open api and pseudo open api generation

## Pseudo open api

we call it that since it is openapi but without the full path names but instead relative to the router

it can be accessed by visting `{routerpath}/opeapi`


## full openapi 

it is not really full opneapi but it can be if you start it from the root from the project

using the createSubrouter you share the openapi spec to children so the root router will have access to the full strcutre



```ts

const app = new App() // the context is shared too



const hhRouter = app.createSubrouter("hhh",{}) //


const child = hhRouter.createSubrouter(...) // app has access to the openapi spec of the childSpec

```



## Built ins
Since this is an opiniated lib on top of express we have prrovided soime builtin things which you could need

### file handler
since by default express does not have a file processing capabilities we have set up one (our choise is [multer](https://www.npmjs.com/package/multer))

# Express plug and play
We have essentially made some heplful wrappers around express but at the core an app is just an `express Router` so if you have an existing express server and you dont want to rewrite you can just do the follwong 



```ts
// for full examples check examples


// your exusting express code

const app2 = new WebSExpress()

app.use(app2.getRouter())
```
