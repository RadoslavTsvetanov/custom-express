import { builder } from "../client-builder";
import { sender } from "../sender";


// simulates a real life example
sender.train.newTrainData({
    line: 6,
    location: {
        latitude: 0,
        longitude: 6
    },
    id: (1).toString(),
    timestamp: new Date()
})