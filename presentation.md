# Slides


## Intro 

### Ask the public who has written backend code and who has used websockets

### Ask how many times have they made typos in their routes atleat once and it has costed them a lot of debugging time 

### Ask how many of them have tried linking backend to their fronted and made a typo somewhere or mistook the type of data or forgot to include some header which was neccessary but they forgot it

### Ask if they have ever used code genration and forgot to rerun the generator after a change and got stuck wondering where is the error meanwhile they just needed to run it again 


### or instead if asking mention the countless times you have made these mistakes and have seen others do them too and windered couldnt someone make a backend toolkit which solves all these issues

### Say that your TYPE SAFE library fixes or atleast tries to fix these issues 

## Type safety

### Explain how it it helps with the all the problems and how auto infering clients is better than code generation for prototyping and ease of mind 

### Tell how with type safety you offload some mental bandwidth to the compiler and the more work i can outsource to the compiler the better especially if it is someredunandt thing like remembering request types, names that are alredy used etc....

### Explain why its so great and you emphasize it so much

### Features

### Go through the docs for this but make a Section called THE eSSENTIALS 

### The slide should be called Features and when you get to it say since i have formatted it pretty well in the docs and i dont think i can do it as good here with examples and etc... we will see it from the docs, then open nvim or the browser and go to essentials page in the docs 


### Effects

#### Tell how to make the world a better place you also included some things in the framework as utilities that are not specific  

#### emphasize how the more code you have the more your brain is clutered with when you are reading code so it is very important for your code to be as simple as possible and as short as possible (however you shouldnt sacrifise a little bit of less code for a lot more complexity, hence why overabstraction is bad) 

#### tell how effects remove a lot of code while  minimizing the abstraction so that the logic being kept from you is minimal and can be easily guesses

#### show example of how much cleaner it is

#### tell how annopying and hard to read is to have very nested function calls 

Example 

```ts
a(b(c(d(e()))))
```

then show how people normally fix this or proceed if they want to debug the output of e for example  
```ts
const eRes = e()
console.log(eRes)


const dRes = d(e)
const cRes = c(d)
const bRes = b(c)
const aRes = a(b) 
```

now show your example 
```ts
e()
.tap(console.log) // resokves to (res => console.log(res));
.map(d)
.map(c)
.map(b)
.map(a)

``` 
much cleaner if you ask me




## my own async api spec

### tell how every language agnostic protocol needs a way to define its spec in a language agnostic way 

now tell about asuync api spec and how you were so excited to not need to think of this for your app but then you while you were hit with somthing while reading the spec 

## technologies

### ts (although a bit redundant i must say it is written in ts since there are plenty of ts libs that are not written in ts as strage as it sounds, for example hono, or nest which uses a but of rust or it was another framework idk)

#### I use it since it is the language i am using the most and so i likely need this the most in ts 

#### Contrary to popular opinions ts is also a very good language (superset to be exact) thanks to its very rich type system one that i have seen inly scala to be better

#### it is the most used language for frontend development and this framework tries to make connecting a backend and a fronted easy 

### Monorepo (turborepo or nx) although not a typical tehnology i am deeply indebted to it since it made the dev process of maintaining  multiple related but not united by bussiness logic projects very easy 

### express since i did not want to reinvent the wheel for http rpute handling 

### uwebscokets since they are faster and better alternative to ws

## Reactive entities

<script>
although this started as a purely websocket frameowrk i notcied a trend where i am essentially not exposing resources but instead entites whiich have to react to one another i included a thing called reactive entites (TODO: find from your notes the description and insert it)</script>

## Examples

TODO: find an open source project which relies heavily on websockets and show how cleaner it would be with your lib, if you cant find show train-y 

TODO: showcase the reactive entites usage using a simple app and see how muxh easier it is 

## Whats next ?

<script_to_tell>
Well lets see what we have at github issues, sorry if i am jumping too much between the presentation and external resources but presentations are quite inflexible to the way you can organize data (since markdown altough goated does not able you with as much as a gui can)
</script_to_tell>

<action>
switch to your project manager software and switch to the most importnat and start going through them 
<action>



<directions>
also dont forget to mention the refactor part 
</directions>

<action>
switch to your types folder
</action>

<script>
also another thing that is very very important is to find a person who understands typescript more than me to help me refactor this abomination since adding a new type here gets exponentially harder and harder and i have no idea how to manage this. And why i am emphasizing on this? - well unlike most projects you see on the fest or hacktues where the ideas are left in the trash bin after the event and the fufture plans slide is therre just because it should be i really believe this is a thing that will actually be used and willl continue maintaining it 
</script>