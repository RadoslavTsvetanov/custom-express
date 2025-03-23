# Slides

## Tell 

## Intro 

### Ask the public who has written backend code and who has used websockets

### Ask how many times have they made typos in their routes atleat once and it has costed them a lot of debugging time 

### Ask how many of them have tried linking backend to their fronted and made a typo somewhere or mistook the type of data or forgot to include some header which was neccessary but they forgot it

### Ask if they have ever used code genration and forgot to rerun the generator after a change and got stuck wondering where is the error meanwhile they just needed to run it again 


or instead if asking mention the countless times you have made these mistakes and have seen others do them too and windered couldnt someone make a backend toolkit which solves all these issues


## Type safety

### Explain how it it helps with the all the problems and how auto infering clients is better than code generation for prototyping 

### Effects 

#### emphasize how the more code you have the more your brain is clutered with when you are reading code so it is very important for your code to be as simple as possible and as short as possible (however you shouldnt sacrifise a little bit of less code for a lot more complexity, hence why overabstraction is bad)

#### tell how effects remove a lot of code while  minimizing the abstraction so that the logic being kept from you is minimal 

show example of how much cleaner it is

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




#### my own async api spec

##### tell how every language agnostic protocol needs a way to define its spec in a language agnostic way 

now tell about asuync api spec and how you were so excited to not need to think of this for your app but then you while you were hit with somthing while reading the spec 

