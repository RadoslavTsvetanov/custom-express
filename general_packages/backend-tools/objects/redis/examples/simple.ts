
// User Schema
const userSchema = createRedisSchema("user", {
  email: { type: 'string', indexed: true },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  age: { type: 'number', indexed: true },
  isActive: { type: 'boolean', indexed: true },
  createdAt: { type: 'Date', indexed: true }
}, {
  dataStructure: 'HASH'  // Store as Redis Hash
});
