import cors from "cors";
import express from "express";

const app = express();
const PORT = 7777;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON body
app.use(express.json());

// POST /log endpoint
app.post("/log", (req, res) => {
    console.log("Received message:", req.body);
    res.status(200);
});

app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
