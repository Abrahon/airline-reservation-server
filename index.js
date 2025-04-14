const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.0xcir2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// ✅ Declare collections in outer scope so routes can access them
let userCollection;
let flightsCollection;

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("wingBooker");

    // ✅ Initialize collections
    userCollection = db.collection("users");
    flightsCollection = db.collection("flights");

    // ✅ USERS ENDPOINTS
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log("Incoming user:", user);

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'User already exists' });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // ✅ FLIGHTS ENDPOINT
    app.post("/flights", async (req, res) => {
      try {
        const { from, to, dateRange, price, classType, img } = req.body;

        console.log("Received flight data:", req.body);

        if (!from || !to || !dateRange || !price || !classType || !img) {
          return res.status(400).json({ error: "All fields are required" });
        }

        const newFlight = {
          from,
          to,
          dateRange,
          price: parseFloat(price),
          classType,
          img,
          createdAt: new Date(),
        };

        const result = await flightsCollection.insertOne(newFlight);
        res.status(201).json({ insertedId: result.insertedId });

      } catch (err) {
        console.error("❌ Error adding flight:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.get('/', (req, res) => {
  res.send('✈️ Airline Reservation System Running...');
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
