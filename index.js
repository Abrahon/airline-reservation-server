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

// 🟩 Declare outside to keep scope
let userCollection;

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("wingBooker");
    userCollection = db.collection("users");

    // GET all users
    app.get('/users',async(req, res)=>{
     const result = await userCollection.find().toArray();
     res.send(result)
  });
  
    // POST user
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log("Incoming user:", user);

      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
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
