# custom-express

Wirting more with less

## Documentation about the websocket


#### Hooks 

Note that hooks can be global or local, local hooks behave in the same way but they apply only to one handler and are declared inside the handler and server more as defining clearer steps in a handler (note that like in global each new hook gets the context that the one before it left so the first beforeSend could change what the next beforeSend will have acces to) for example this is cool when we want to loggically seperate the auth step and we will have something like this (see the below example )

life-cycle event is stored as a queue, aka first-in first-out. So Elysia will always respect the order of code from top-to-bottom followed by the order of life-cycle events.

Note that if you do not explicitely ovverride the return by default the current handler will pass the context it recieved to the next handler, if you return the END utility variable nothing will be ran after the handler 

```
import { Elysia } from 'elysia'

new Elysia()
    .onBeforeHandle(msg => {
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
To avoid redudndancy and code duplication you can hook into the luifecycle of requests into the client to not just the server since logically a websocket is split into a listener and a sender on both sicdes and they expose both expose hooks


###### beforeSend 

in the client this hook is ran befire sending the data actually, for example every essage needs to have an id in it so you either do
```ts
clientBuilder.generateClient().map(a => {
a.train.sendalert({...rest_of_data, id: id})
a.train.sendMessage({....rest_of_the_data, id: id})
})

or you do 

clientBuilder.generateClient({
beforeSend: msg =>  {...msg, id: getID() /* yes you add it  */ }
}).map(a => {
a.train.sendalert(data)
a.train.sendMessage(data)
})


// it also works like that with creating a server 

definition
.add({
beforeSend: msg => msg.payload = {...msg.payload, id: getID() }
}).
implement({
	onNewAlert: ({ws}) => ws.send({msg: "hi"}) // before send will automatically add id to this
})
```

###### afterSend

runs after each sent message 


##### Listener

###### onError 

runs whenever an exception is thrown in a beforeHandler, handler or afterHandler 

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

.parse("json" | "yml")



###### guard

this is a type of beforeHandle which checks if an object has the properties of the schema inside guard and if not it runs a handler, if the handler is left omitted it refuses the connection by default 

example
```ts
///rest of the code
.guard({
id: z.sttring()},
(ws) => { console.lof("sus user") })


```

###### match 

this is a tyope of beforeHandle which checks if a entity is of this type it works like guard but instead of checking if a value is there it also checks for differences and if they differ it triggers the handler which by def is to close the connection

###### transform 

a type of beforeHandle which gets the current body and transofrm it into something else, note that depending in the placement it can before a validator or after one and so it can serve different usecases (either make every request sompliant if it before or transform a validated request into something more useful)

###### 

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

```
/ lib code
app.validate("jaking").validate("omnimaning")

/ your code

app.use(ingMidlleware)



```


and you want to do somethign before omnimaning but after jaking you can do it like this 

app.before("omnimaning", { // yeah you can define multiple handlers like that too 
() => {},
() => {}
})

there is also after hook which works exaclty as you think it would 


#### afterHandle


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

#### Disclaimer i took a lot of inspiration from hono and elysia js for these hooks (btw take a look at them one more time to get more features)

without this you would have needed to do either do the logic in the two routes seperately ir to wrap them both in a function.  Think of this like a middleware you can put after requests not before them

##### Using subrouters for optional hooks

since hooks are on router level 

```ts

```

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

## safe envs 
we have added a package which provides a type safe way to refrnce envs and also enables you to define custom getters


## Building on top of openapi 

Openapi is great but i think it can be improved so i extended the openapi schema that way existing tooling can still use the definitions it just wont show/use the extra

### Pseudo open api

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

# Use cases

## Standalone project

 you can use it as you defacto library and only use it

## Hybrid

you can use it for some path and use express for others since they can easilt morph into one another and like that get the benefits only at the routes you want since  it does come with some negatives and you wouldnt like them to affect your whole code base

you can alsao lpug it into existing express project and never use express again but still not needing to migrate your codebase





# Docs

## Getting a never from a function

Getting a never from a function means you mesed something for example 


## Note on method chaining 

for ts to make its magic you need to use emthod chaining since for new components to appear on the old type  we need to make an intersection on the types so you need to use method chaining 

```ts
Method Chaining

Elysia code should always use method chaining.

As Elysia type system is complex, every methods in Elysia returns a new type reference.

This is important to ensure type integrity and inference.

import { Elysia
 } from 'elysia'

new Elysia
()
    .state
('build', 1)
    // Store is strictly typed
    .get
('/', ({ store
: { build
 } }) => build
)
    .listen
(3000)

In the code above state returns a new ElysiaInstance type, adding a build type.
❌ Don't: Use Elysia without method chaining

Without using method chaining, Elysia doesn't save these new types, leading to no type inference.

import { Elysia
 } from 'elysia'

const app
 = new Elysia
()

app
.state
('build', 1)

app
.get
('/', ({ store
: { build } }) => build
)
Property 'build' does not exist on type '{}'.

app
.listen
(3000)

We recommend to always use method chaining to provide an accurate type inference.
```

```ts
 Main Navigation
Cheat Sheet
Plugins
Blog

Sidebar Navigation
Getting Started

At Glance

Quick Start

Tutorial

Key Concept

Table of Content
Essential

Route

Handler

Life Cycle

Validation

Plugin

Best Practice
Patterns

Macro

Configuration

Cookie

Web Socket

Unit Test

Mount

Trace
Recipe

OpenAPI

Opentelemetry

Drizzle

React Email

Better Auth
Eden

Overview

Installation
Eden Treaty

Overview

Parameters

Response

Web Socket

Config

Unit Test

Legacy (Treaty 1)

Eden Fetch
Plugins

Overview

Bearer

CORS

Cron

GraphQL Apollo

GraphQL Yoga

HTML

JWT

OpenTelemetry

Server Timing

Static

Stream

Swagger

trpc
Integration

Nextjs

Expo

Astro

SvelteKit
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
Method Chaining

Elysia code should always use method chaining.

As Elysia type system is complex, every methods in Elysia returns a new type reference.

This is important to ensure type integrity and inference.

import { Elysia
 } from 'elysia'

new Elysia
()
    .state
('build', 1)
    // Store is strictly typed
    .get
('/', ({ store
: { build
 } }) => build
)
    .listen
(3000)

In the code above state returns a new ElysiaInstance type, adding a build type.
❌ Don't: Use Elysia without method chaining

Without using method chaining, Elysia doesn't save these new types, leading to no type inference.

import { Elysia
 } from 'elysia'

const app
 = new Elysia
()

app
.state
('build', 1)

app
.get
('/', ({ store
: { build } }) => build
)
Property 'build' does not exist on type '{}'.

app
.listen
(3000)

We recommend to always use method chaining to provide an accurate type inference.
Dependency

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

```ts

```
# Questions 

## Why are we using zod 


First of all Zod is amazing and allows you to add checks on top of the normal type system

Second since we need to dynamically add information to our openapi spec and types cant be accessed during runtime we are "outsourcing" our types to zod which is an object 




# aim of the project
- a lightweight library
- compatilbe with express
- be as feauture rich as possible without teurning it into a framework


# Things to steal feautures from 
- encore js
- elysia js
- hono js
- nest js


# Features that will be implemented nexts

## Guards

https://elysiajs.com/essential/plugin.html#scope, however they will look a bit different you will be defining them on a subroute level since it will be hard to implement them to get to subroutes too, also if you define a guard on the router and then another one on the route level they will combine, on the guards you can define a guard on the 
query body etc...

They are a bit out of order but guards are abstraction on top of the before and after request hook, before is for the req body, params query etcc... and after is for the response, you can define them on verb and subroute level.
You could use them on route level but you can just placethe logic inside a customValidator on one of the generic zod types when defining your validator


## hooks

like elysia hooks https://elysiajs.com/essential/life-cycle , https://elysiajs.com/integrations/cheat-sheet.html, again hust like the guards they are on the subroute level and implementing them to be passed will be entire feature entirly (we need to decide how will they even be appiled will it be from parent to child or from child to parent). They can be defined on the verb, subrouter and subroute level


```ts
Lifecycle Hook

Intercept an Elysia event in order

See Lifecycle

import { Elysia, t } from 'elysia'

new Elysia()
    .onRequest(() => {
        console.log('On request')
    })
    .on('beforeHandle', () => {
        console.log('Before handle')
    })
    .post('/mirror', ({ body }) => body, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        }),
        afterHandle: () => {
            console.log("After handle")
        }
    })
    .listen(3000)
```

## Custom parsers 

You can define a subrouter or a subroute parser which is again an abstraction over the beforeRequest hook they can again be defined on the verb, route and subroute levels 


```ts
Guard

Enforce a data type of sub routes

See Scope

import { Elysia
, t
 } from 'elysia'

new Elysia
()
    .guard
({
        response
: t
.String
()
    }, (app
) => app

        .get
('/', () => 'Hi')
        // Invalid: will throws error, and TypeScript will report error
        .get
('/invalid', () => 1)
Argument of type '() => number' is not assignable to parameter of type 'InlineHandler<MergeSchema<UnwrapRoute<InputSchema<never>, TModule<{}, {}>, "/invalid">, MergeSchema<{}, MergeSchema<{}, { body: unknown; headers: unknown; query: unknown; params: {}; cookie: unknown; response: { 200: string; }; }, "">, "">, "">, { ...; } & { ...; }, "/invalid">'.
  Type '() => number' is not assignable to type '(context: { body: unknown; query: Record<string, string>; params: {}; headers: Record<string, string | undefined>; cookie: Record<string, Cookie<string | undefined>>; ... 8 more ...; error: <const Code extends 200 | "OK", const T extends Code extends 200 ? { ...; }[Code] : Code extends "Continue" | ... 58 more ... |...'.
    Type 'number' is not assignable to type 'Response | MaybePromise<string | ElysiaCustomStatusResponse<200, string, 200>>'.
    )
    .listen
(3000)
```

# What are we currently working on ?

## TypeSockets

we are trying to make end to end typesafe cleint server socket communicstion tooling 


Here is roughly what we are trying to achieve: 


```ts



server.channe("/someroute",{
	onMessage: (msgType: MsgTypes) => {
		
	}
	messagesThatCanBePublished: {
		quit: { // like this you define the name of the message
			field: number
		}
	
	}
})


export const server.generateCleint()


```

like this you define your ws socket handler as you can see you can define a channel, a channel is like a http route but for websockets and you define the schema of your requests so that you can get typesafety on your client too



```
import {client} from "../"


client.someRoute.onMessage({
	quit: (msg: {fieldId}) => {
			.... // your handler
		}


})



like this we can define typesafe communication between a cleint and a webso0cket server and this opens the doors to many thiings


for example you can create


// react component 
function Hi(){
	const [name, setName] = usestate<someRoute.quitType>()
	useEffect(() => {

		cleint.someRoute.onMessage({

			quit: (g) => {
					setName("gg") // X
					setNAme(g) will work
			}
		})
		
	},[])


	return <div></div>
}



```





## Commonly asked questions 

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

you can publish your backend as an npm package and import the client 

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
