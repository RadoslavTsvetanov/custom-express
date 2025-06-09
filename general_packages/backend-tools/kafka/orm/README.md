# kafka-orm


Ts orm making your kafka experience better

# Features

## Type safety 

you define your schema so that you have type info about the topics at compile time 

## No code generation

if you decide to use ts for your producer or consumer sincee we are on the samwe lang you can use the config.createConsumer and config.createPubllishre to recieve end to endtype safe clients without any code generation

## Code generation if you need it 

Although no code gen is best sometimes its not possible so you can use the `kafka-orm-cli --generate <language> --schema <path_to_file> (by default it searches for the kafka-schema.ts in the cwd)` to get a file with type defenitions and client for publisher and consumer in the desored lang (for now scala and ts are supported) 

## Config as ts code

you cand define your kafka config as ts code and use `kafka-orm-cli --create --schema ...` to create a new kafka cluster with the desired config 

## Service level typesafety using a docker container

we provide a base docker img which you can use so that you spin up a kafka instance with a wrapper arounf it which does type checkign on the messages ensuring that there is no way in which a message that does not adhere to the rules can be published in the topic (No Manual Checks: Developers no longer need to manually check if a message conforms to the expected format, reducing human error. The system automatically rejects any message that doesn't fit the schema, preventing data corruption or issues down the line, this is very useful since someone could forget using the orm and publish a message that does not adhere to the standard and that could cause issues down the line )
