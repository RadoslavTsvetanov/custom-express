# Features

## Command pallete for executing custom actions from a command like object in the frontend
it was developed since existing alterntaives do not allow to get the context of the chosen option and run a function against it so that sttyling the chosen part is customanzible and personalized

In most alternatives there is 
<CommandPallet options={...} onSlected={..some_style}/>

if you want to work arpund this you have to store the style in some state for dynamic chnages and its a mess ....

ours is 

<CommandPallete option={} onSleceted={(option => .....)}/>



## Custom Navigation

Brings the power of pages navigation without the need of a url, well there is a url but you save it internally in your app allowing you to easily compose pages like components 

features and object based router too soc that instead of your url being a string like /rado/1 it is {name: rado, order: 1}
