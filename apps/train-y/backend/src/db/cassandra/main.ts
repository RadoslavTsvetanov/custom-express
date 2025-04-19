import expressCassandra from "express-cassandra";

const cassandraOptions = {
  clientOptions: {
    contactPoints: ["127.0.0.1"], // Replace with your Cassandra node addresses
    localDataCenter: "datacenter1", // Replace with your Cassandra datacenter
    keyspace: "my_keyspace", // Replace with your Cassandra keyspace
  },
  ormOptions: {
    define: {
      timestamps: false,
    },
  },
};

const cassandraClient = expressCassandra.createClient(cassandraOptions);

// Define the Event schema
const event = cassandraClient.loadSchema("event", {
  fields: {
    start_timestamp: { type: "timestamp" },
    end_timestamp: { type: "timestamp" },
    content: { type: "text" },
  },
  key: ["start_timestamp"],
});
export type Event = typeof event;
export { event, cassandraClient };
