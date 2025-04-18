# Blazesockets 

Writing more with less


## Documentation 

#### Handlers

Just like the standard ws lib we expose events you can listen for and everytime this event happens we run your `handler`


We expose the following handlers

##### onConnection

runs whever a connection is established 
 
- you can hook on it with beforeConnection which is executed before the handler you define, again this is a hook you wont need probably but is very good for writing plugins and/or authentication of connections (yeah if you dont want to manually define repetitve funcs you can use a gaurd here )


Example 

```ts
...// your app code
.onConnection({
    before: {
      guards: [
        {
          schema: {},
          () => {} // handler if validation fails, by default it sends a message to the socket and closes the connection, so it left without a value the default will be apllied 
        }
      ]
    }
  })
```

you can also supply after hooks will be passed whenever 

##### onClose

runs whenver a connection is closed (recieves matedata both from the close and the data which was passed onConnection for this socket)


##### Message handler
here it is discussed only the handler for hooks defining in handler look at `Hooks` section 

so a handler is a function which rans when a certain message is recieced that agrees to the schema defined for the websockets

You can define a validator for your handler and this is essesntially a guard or a match which runs when a message is handled (so it runs before any local hook - excalidraw diagram for more details)

(application code inisight -> techniclly a message handler is just a hook too)


*Note*: in a message handler you need to define a `parse`, a parse is a before handle guard hook that is ensured to run right before the handler so that the type of the message is the one you define in the parse  

##### onRecievedMessage

in reality there is not a real handler with this name but you can use a `beforeHandle` hook so that you run something before any new message which transofrms the message 

#### Hooks 

Note that hooks can be global or local, local hooks behave in the same way but they apply only to one handler and are declared inside the handler and serve as a way of defining clearer steps in a handler (note that like in global each new hook gets the context that the one before it left so the first beforeSend could change what the next beforeSend will have acces to) for example this is cool when we want to loggically seperate the auth step and we will have something like this (see the below example )

Note that if you do not explicitely ovverride the return by default the current handler will pass the context it recieved to the next handler, if you return the END utility variable nothing will be ran after the handler 

```ts
    .onBeforeHandle(({msg, ws: s }) => {
    	if(msg.payload.authToken === null){
     	// a token shoukd be provided
     	ws.close()
      }
	}
        console.log('1')
	return {...msg, : ""}
    })
    .onBeforeHandle(({authToken /* note we can access hihi*/}) => {
    // the provided token should be valid 
    if(!TokenExists(authToken)){
    ws.close()
    }
    console.log(5)
    })
    .onAfterHandle(() => {
        console.log('3')
    })
    .onAfterHandler(() => console.log(4))
    .handler('/newalert', () => 'hi', {
        beforeHandle({authToken}) {
            console.log('2')
	    return {
     		userId: getUserIdFromAuthToken(authToken)
	    }
        },
	beforeHandle({userId /* *note that the above handler only defines the userId so we wont have access to anything else/} => {
 		console.log("18")
   		return {
     			user: User.new(userId)
		}
	})
	handler: ({user} /* note it only has access to user nothing else*/) => user.alert();console.log("10"); return {koko: generateRequestMetadataForLog(), kuku: ""},
 	afterHandle: (msg, {koko}) => {
  	const logResult = log(koko)
  	console.log(8)
	return {
 		...msg, 
   		logResult
		}
 	}
    }).
    afterHandle({logResult} => {
    if(logResult){
    // do something you got the point 
    }
    })
    .listen(3000)

Console should log the following:
// finish this example
1
5
2
3
4
```
##### Sender 
To avoid redudndancy and code duplication you can hook into the luifecycle of requests into the sender (e.g. the sender from the `ws` object provided in the context) to not just the server since logically a websocket is split into a listener and a sender on both sides and they both expose hooks


###### beforeSend 

in the client this hook is ran before sending the data, for example every message needs to have an id in it so you either do

```ts
clientBuilder.generateClient().map(a => {
  a.train.sendalert({...rest_of_data, id: id}) a bit redundant 
  a.train.sendMessage({....rest_of_the_data, id: id}) a bit redundant 
})

//  or you do 

clientBuilder.generateClient({
beforeSend: msg =>  {...msg, id: getID() /* yes you add it  */ }
}).map(a => {
a.train.sendalert(data)
a.train.sendMessage(data)
})


// it also works like that with creating a server 

definition // this modifies the sender field of the `ws` object provided to you in the starting point of a message 
.add({
beforeSend: msg => msg.payload = {...msg.payload, id: getID() }
}).
implement({
	onNewAlert: ({ws}) => ws.send({msg: "hi"}) // before send will automatically add id to this
})
```

###### afterSend

runs after each sent message 

*NOTE* since hooks can be global or local here you can too provide a hook only to a group of the handlers,
for example 


```ts
definition.add({
  local: {
    auth: {
      /// your hooks 
    } // here you will get intellisense with all the channels you can send messages to 
  }
}) // the method is overloaded
```


##### Listener


###### onError 

runs whenever an exception is thrown in a beforeHandler, handler or afterHandler 

the context which the global onError recieves is both the original Error and the mapped result (this is the same behaviour as every other local to global e.g. every global counterpart of the local one recieves the context that the first handler of the chain got and the result of the last mapped one )

To perform linear regression on the given data and make predictions, we can use a simple code implementation in Python. The approach involves calculating the linear regression parameters (slope and intercept) from the data using formulae and then using these parameters to make predictions.

Here's a function that accomplishes this:

```python
def linear_regression(relation, input_column, output_column, input_value):
    # Calculate the averages of input and output columns
    n = len(relation)
    sum_x = sum(item[input_column] for item in relation)
    sum_y = sum(item[output_column] for item in relation)
    avg_x = sum_x / n
    avg_y = sum_y / n

    # Calculate the slope (m) and intercept (b) for the line y = mx + b
    sum_xy = sum(item[input_column] * item[output_column] for item in relation)
    sum_xx = sum(item[input_column] ** 2 for item in relation)

    # Using the formula: slope (m) = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
    slope = (sum_xy - n * avg_x * avg_y) / (sum_xx - n * avg_x ** 2)

    # Using the formula: intercept (b) = ȳ - m * x̄
    intercept = avg_y - slope * avg_x

    # Calculate the predicted value using the line equation: y = mx + b
    prediction = slope * input_value + intercept
    
    return prediction

# Example usage
relation = [
    {"x": 1, "y": 2},
    {"x": 2, "y": 4},
    {"x": 3, "y": 6}
]
input_column = "x"
output_column = "y"
input_value = 4

predicted_value = linear_regression(relation, input_column, output_column, input_value)
print(f"Predicted value for {output_column} when {input_column} is {input_value}: {predicted_value}")
```

This code computes the slope and intercept of the line of best fit for the provided data, and then it uses these to predict the `output_column` value corresponding to the given `input_value`.

Remember to adjust your environment to run the code by installing any required libraries if using a more advanced version, or make necessary adjustments if integrating into a larger system.

###### beforeHandle



in this listener hook you can transform the data before it arriving to your handler

Imagine you want to create a user class from the id you recieve from a message so without it you would need to do it like this 

```ts
clientBuilder().generateListener().add({
onNewAlert: msg => User.new(msg.payload.id).alert("hihi"),
onNewMessage: msg => User.new(msg.payload.id).message("hihi")
})

// and with it you would do 


clientBuilder().generateListener().beforeHandle(msg => {...msg, user: User /*yes you can add properties directly to the message that didnt exist before*/).add({
onNewAlert: ({user}) => user.alert("hihi"),
onNewMessage: ({user}) => user.message("jihi")
})
```

Another use case is to use it for custom parsing for example there is a text format we dont support in our builtin parse hook (which is a wrapper around onBeforeRequest)


###### parse

 although there is nothing stopping you from using this in a afterHandle stack it is not useful to use it and it will cause bugs probably

```ts
.parse("json" | "yml")
```


###### guard

this is a type of beforeHandle which checks if an object has the properties of the schema inside guard and if not it runs a handler, if the handler is left omitted it refuses the connection by default (a reminder it is kept in the same stack as all other beforeHandles) 

example
```ts
///rest of the code
.guard({
id: z.sttring()},
(ws) => { console.lof("sus user") }) // here we define a handler to run when the validation fails, note that if a guard fails all the hooks after it (beforeHandle ordered, the handler, after Handle ordered hooks). However hooks like afterHandle will be ran since they are ran after every request (this could change in future iterations) 


```

###### match 

this is a tyope of beforeHandle which checks if a entity is of this type it works like guard but instead of checking if a value is there it also checks for differences and if they differ it triggers the handler which by def is to close the connection. Regarding to behaviour and failure 9it is the same as `guard`

###### transform 

a type of beforeHandle which gets the current body and transofrm it into something else
*Note* that depending in the placement it can before a validator or after one and so it can serve different usecases (either make every request compliant if it before or transform a validated request into something more useful)
*Note* : this hook is just a basic hook handler wrapper which enforces you to return something (by something we mean different from `END` too)


### Overriding order 

since every hook needs to be given a unique id this opens the gate to overrding order 


For example 

```ts
.guard("hiuhi", () => console.log(0))
.guard("omnimaning it", () => {console.log(1)})
.before("omnimaninn it " /* not it is typesafe so dont worry */, () => {
console.log(2)})
```
v

will result into 
```
0
2
1
```
this is helpful if you use a middleware which applies some kind of hook and you want to be before it you can do it like this and not needing to edit the library, To understand this better since the example is not that good imagine this middleware which comes from a node package (e,g, it is not a good idea to edit it)

```ts
// lib code
const ingMiddleware  = app.validate("jaking").validate("omnimaning")

// your code

app2.use(ingMidlleware)
```


and you want to do somethign before omnimaning but after jaking you can do it like this 

app.before("omnimaning", { // yeah you can define multiple handlers like that too 
() => {},
() => {}
})

there is also after hook which works exaclty as you think it would 


##### afterHandle


it is exexcuted after you handler and it is useful for common scenarios, for example you have two handlers and after they are done each of them needs to do the same thing. 

Whe  used in normal http api you have access to the response object before it is being sent so you can use it to modify the request before it is sent. For example you do an operation on the backend and if the operation was succefull you refresh the user token 

```ts
handle("/do-something", (req) => {
	
	const result = trySomething("")
	return {
		wasSuccesful: result.success
	}

})
handle("do-anotherthing", req => {

		const result = tryAnotherThing("")
		return {
			wasSuccesful: result.success
		}
	}
)
afterHandle(req, res) => {

	if(res.wasSuucefull){
		res.headers.newToken = genToken(req.userId) // yes you get access to the request that the handker 			recieved too
	}
}

}
```

without this you would have needed to do either do the logic in the two routes seperately ir to wrap them both in a function.  Think of this like a middleware you can put after requests not before them

#### Disclaimer i took a lot of inspiration from hono and elysia js for these hooks (btw take a look at them one more time to get more features)


##### Using subrouters for conditional hooks

if you apply hooks to a prefixed app or to a certain channel definer they will become local instead if explicitely overriden 

##### ordered vs unordered hooks 

###### Unordered

the result of the first is not pssed to the second so you dont have to comply with the result expected by a hook or the modification of the context passed instead all of them recieve the first context of the step. These are good for things which should get the primordial (find a better word next time) context and dont need to moidfy it so they shouldnt need to compily with other hooks before and after them (for example a request kogger is preferably to be here)

###### Ordered

the result of the first is pssed as the result to the second so this allows for some complex typesafe pipelies 


###### 5pecyfying place

by default hooks are `ordered` unless explicitely passing a flag

### Utils  

although our core was to simplify the development of websockets we also went our way to define some systems which might not be making building websocket system easier directly we made some utilities which help in day to day writing of logic inside websockets

####


#### safe envs 
we have added a package which provides a type safe way to refrnce envs and also enables you to define custom getters




#### Building on top of openapi 

Openapi is great but i think it can be improved so i extended the openapi schema that way existing tooling can still use the definitions it just wont show/use the extra

#### Pseudo open api

we call it that since it is openapi but without the full path names but instead relative to the router

it can be accessed by visting `{routerpath}/opeapi`


### full openapi 

it is not really full opneapi but it can be if you start it from the root from the project

using the createSubrouter you share the openapi spec to children so the root router will have access to the full strcutre



```ts

const app = new App() // the context is shared too



const hhRouter = app.createSubrouter("hhh",{}) //


const child = hhRouter.createSubrouter(...) // app has access to the openapi spec of the childSpec

```

## Custom client 

ALthough openapi is great you need to manually genrate a cleint and yeah you could use a lin=brary but then you need to automate the genration on every new change, well we did just that we provide a client for you in an `RPC` like manner

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
-------
```ts
Key Concept
We highly recommended you to read this page before start using Elysia.

Although Elysia is a simple library, it has some key concepts that you need to understand to use it effectively.

This page covers most important concepts of Elysia that you should to know.
Everything is a component

Every Elysia instance is a component.

A component is a plugin that could plug into other instances.

It could be a router, a store, a service, or anything else.

import { Elysia
 } from 'elysia'

const store
 = new Elysia
()
	.state
({ visitor
: 0 })

const router
 = new Elysia
()
	.use
(store
)
	.get
('/increase', ({ store
 }) => store
.visitor
++)

const app
 = new Elysia
()
	.use
(router
)
	.get
('/', ({ store
 }) => store
)
	.listen
(3000)

This force you to break down your application into small pieces, making it to add or remove features easily.

Learn more about this in plugin.
Scope

By default, event/life-cycle in each instance is isolated from each other.

import { Elysia
 } from 'elysia'

const ip
 = new Elysia
()
	.derive
(({ server
, request
 }) => ({
		ip
: server
?.requestIP
(request
)
	}))
	.get
('/ip', ({ ip
 }) => ip
)

const server
 = new Elysia
()
	.use
(ip
)
	.get
('/ip', ({ ip }) => ip
)
Property 'ip' does not exist on type '{ body: unknown; query: Record<string, string>; params: {}; headers: Record<string, string | undefined>; cookie: Record<string, Cookie<string | undefined>>; ... 8 more ...; error: <const Code extends number | keyof StatusMap, const T = Code extends 100 | ... 58 more ... | 511 ? { ...; }[Code] : Code>(code: Code, res...'.
	.listen
(3000)

In this example, the ip property is only share in it's own instance but not in the server instance.

To share the lifecycle, in our case, an ip property with server instance, we need to explicitly says it could be shared.

import { Elysia
 } from 'elysia'

const ip
 = new Elysia
()
	.derive
(
		{ as
: 'global' }, 
		({ server
, request
 }) => ({
			ip
: server
?.requestIP
(request
)
		})
	)
	.get
('/ip', ({ ip
 }) => ip
)

const server
 = new Elysia
()
	.use
(ip
)
	.get
('/ip', ({ ip
 }) => ip
)
	.listen
(3000)

In this example, ip property is shared between ip and server instance because we define it as global.

This force you to think about the scope of each property preventing you from accidentally sharing the property between instances.

Learn more about this in scope.

app
.listen
(3000)


By default, each instance will be re-execute everytime it's applied to another instance.

This can cause a duplication of the same method being applied multiple times but some methods should be called once like lifecycle or routes.

To prevent lifecycle methods from being duplicated, we can add an unique identifier to the instance.

import { Elysia
 } from 'elysia'

const ip
 = new Elysia
({ name
: 'ip' })
	.derive
(
		{ as
: 'global' },
		({ server
, request
 }) => ({
			ip
: server
?.requestIP
(request
)
		})
	)
	.get
('/ip', ({ ip
 }) => ip
)

const router1
 = new Elysia
()
	.use
(ip
)
	.get
('/ip-1', ({ ip
 }) => ip
)

const router2
 = new Elysia
()
	.use
(ip
)
	.get
('/ip-2', ({ ip
 }) => ip
)

const server
 = new Elysia
()
	.use
(router1
)
	.use
(router2
)

This will prevent the ip property from being call multiple time by applying deduplication using an unique name.

Once name is provided, the instance will become a singleton. Allowing Elysia to apply plugin deduplication.

Allowing us to reuse the same instance multiple time without performance penalty.

This forces you to think about the dependency of each instance, allowing for easily applying migration or refactoring.

Learn more about this in plugin deduplication.
```

## Defining your request models 

we use zod for validating requests and generating openapi definitions so you should familiriaze with it (not that its difficult the devs have really made it amazing to work with for new devs ) 

Here are some example 



## Optional parameters 

Note: by default every paramter is required so you need to explicitely make it optional (yeah we decided it like that, yeah we think thts the way, no you dont want otherwise, think of how much of your route handlers will fail if sone parameter you are accessing directly without checking if its really there will fail)



zod provides three way to make a parameter optional:

// credits to https://gist.github.com/ciiqr/ee19e9ff3bb603f8c42b00f5ad8c551e for this

// z.object({
//     // valid if string or:
//     optional: z.string().optional(), // field not provided, or explicitly `undefined`
//     nullable: z.string().nullable(), // field explicitly `null`
//     nullish: z.string().nullish(), // field not provided, explicitly `null`, or explicitly `undefined`
// });

// type
// {
    // optional?: string | undefined;
    // nullable: string | null;
    // nullish?: string | null | undefined;
// }

however for requests defintions (body, parameters etc...) we recommend not using null since not every language has it and i dont think you can recieve a parameter with value of null. For example if you say a parameter could or could not be there you will do something like this 
```ts

req.body.hhhh // if not there will resolve to undefined and nullable will throw an error since its undefined not null
```

# aim of the project
- a lightweight library
- compatilbe with express

# Things to steal feautures from 
- encore js
- elysia js
- hono js
- nest js

## examples

To see example usage and some advanced usage (for example how to use guard so that we ensure all messages from a certain channel return a common subset of properties in a type safe way) go to the guthub page and search for the examples folder (TODO: add github link to the examples)


### Ensuring we always return as a response from a sender

this is how it will work in an http server too

```ts
app.beforeSend({
  position: 0 // we ensure it is the first after send handler so that we ovverride the type, since the return type of  a send should comply with the ctx type of the first beforeSend, this will also work with after send its just that it the validation here will happen as we are passing the arguements for send instead of getting a runtime error when we try to send, for the http client however it does matter to be before since afterSend will modify the response it recieves,
  handler: guard({
      schema: z.object(z.any()),
      // handler is left empty so if it does not match it will close the connectiom
  })
})
```

### Ensuring we only recieve json messages 

```ts
app.beforeHandle(guard({
sc
}))
```

### having access to all connections in every handler 

```ts
app
.store({
  connections: new Connections()
})
.beforeHandle({
  key: "add_connection",
  handler: ({ctx: {ws}, store: {connections}}) => {
     connections.add(ws)
  }
})
```

## Commonly asked questions 


### is there a way to port an existing express project to your framework 

Well we are thinking of a silution but for now dont forget that you can use our app inside an existing express app and that way you can have our app as an extension of your 

### Getting a never from a function

Getting a never from a function means you messed something for example adding a channelwith a name of a channel that already is already in use will return never, since we cant place error messages in the type system you can alway run a code that rureturns never to see the runtime error




### typesafety not working 
you are not method chaining 

```ts
❌ Broken Method Chaining (no type safety):
class RpcNode {
  connect() {
    console.log("Connected");
    // Forgot to return 'this'!
  }

  send(data: string) {
    console.log(`Sending: ${data}`);
    return this;
  }
}

const node = new RpcNode();

// This will error or not work as expected
node.connect().send("hello");

✅ Fixed Version (method chaining + type safety):

class RpcNode {
  connect(): this {
    console.log("Connected");
    return this;
  }

  send(data: string): this {
    console.log(`Sending: ${data}`);
    return this;
  }
}

const node = new RpcNode();

node.connect().send("hello").connect(); // All good, fully type-safe
```


### I am using a bundler and the client is outside the root of the project what to do 

First of all this question commonly arrises when needing to make a docker container for something which uses the exported client 


For example you have the folloing 



```
/frontend 
- index.ts (uses the client)
/backend (exports the client)
```

if we make a docker file for the frontend it will throw n error since we are importing it from outside the root of the project 

there are 3 solutions

you can publish your client as an npm package and import the client (i reccoomend setting up a monorepo instead of publishing to npm )

you can out your backend inside the frontend folder for just building the client 

you can make the root of the frontend to be also the one for the backend



Example:

instead of having thrm as two seperate projects
```
/frontend
- index.ts
- package.json
/ backeend
- index.ts
- package.json
```

have
```
package.json (for both the frontedn and the backend)
/frontend
- index.ts
/backeend
- index.ts
```



# Lifecycle
(TODO: insert picture of the excalidraw diagram)

## Best practices

### use `as const`

using as const to make the ts compiler help you more 


Look at this example 

```ts
function hihi(v: string) { 
    if (v.length == 3) {
        return "g" 
    } else {
        return "j"
    }
}

const gg = new HookBuilder()
  .add({
    key: "koko",
    execute: (v) => {
      return {
        hi: "",
      };
    },
  })
  .add({
    key: "lolo",
    execute: (v) => {
      return {
        ...v,
        koki: hihi("so"),
      } as const; // to ensure no modification and better type inference e,g, it shortnes the scope as much as possible 
    },
  })
  .add({
    key: "koki",
    execute: (v) => {}, // here the return type of v is /parameter) v: {readonly koki: "g" | "j";readonly hi: string;} without it whough it is v: {koki: string;hi: string;}
  });
```


# Built ins 
by default every websocket server also can send error messags and so you can define on the client handler for that but the point is that it is built in just use the `ws.sendError()` for typsafety 😃 since it will only allow you to send errors you have defined 