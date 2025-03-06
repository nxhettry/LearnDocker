import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// MongoDB connection URL (using Docker container name)
const mongoUrl = "mongodb://mongodb:27017";
const dbName = "studentDB";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add new student
app.post("/api/students", async (req, res) => {
  try {
    const result = await db.collection("students").insertOne(req.body);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await db.collection("students").find({}).toArray();
    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
