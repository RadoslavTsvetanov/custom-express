import { fetch } from "bun";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 7777;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// POST /log endpoint
app.post("/log", (req, res) => {
  console.log("Received message:", req.body);
  res.status(200)
});
const response = await fetch(`http://localhost:${PORT}/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Hello from Bun!" }),
  });

// Start server
// app.listen(PORT, async () => {
//   console.log(`Server running at http://localhost:${PORT}`);

//   // Send a JSON request after the server starts
  
//   const text = await response.text();
//   console.log("Response from /log:", text);
// });
