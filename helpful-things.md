# your type magic is not working ?

try using `as const`

# `"key"` for object indexing ?

no we dont have convention for it do it as you like sometimes "key" i sued instead of key since the autoinfer is so sweet that we dont have too look at the type but instead put a blank "" and it intellisenses it

# Note on type tests

Even if type tests does not mean the code wont work as expected in runtime they as important as the runtime ones since they ensure proper intellisense when using the library


# Gotcha when making submodules


for somme reason bun wworkspaces does not work when having the module set to any entry it has to be the index.ts not sr/index.ts or src/main.ts it has to be in the root dir an also preferably to be just export statements e.g. you do not define anything in it but instead you reexport