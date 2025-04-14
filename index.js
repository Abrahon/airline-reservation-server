const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

// Declare collections
// let userCollection;
// let flightsCollection;

async function run() {
  try {
    await client.connect();

    console.log(" Connected to MongoDB");
    const userCollection = client.db('wingBooker').collection('users');
    const flightCollection = client.db('wingBooker').collection('flights');
    const bookingCollection = client.db('wingBooker').collection('bookings');

    // USERS
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const existingUser = await userCollection.findOne({ email: user.email });

      if (existingUser) {
        return res.send({ message: 'User already exists' });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //  FLIGHTS - GET
    app.get('/flights', async (req, res) => {
      try {
        const result = await flightCollection.find().toArray();
        res.status(200).json(result);
      } catch (err) {
        console.error("Error fetching flights:", err);
        res.status(500).json({ error: "Failed to fetch flights" });
      }
    });

    // FLIGHTS - POST
    app.post('/flights', async (req, res) => {
      try {
        const { from, to, dateRange, price, classType, img } = req.body;

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

        const result = await flightCollection.insertOne(newFlight);
        res.status(201).json({ insertedId: result.insertedId });
      } catch (err) {
        console.error("Error adding flight:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/flights/:id", async (req, res) => {
        try {
          const id = req.params.id;
          const flight = await flightCollection.findOne({ _id: new ObjectId(id) });
      
          if (!flight) {
            return res.status(404).json({ error: "Flight not found" });
          }
      
          res.status(200).json(flight);
        } catch (err) {
          console.error("Error fetching flight details:", err);
          res.status(500).json({ error: "Failed to fetch flight details" });
        }
      });

    //   booking

    app.post('/bookings', async (req, res) => {
        try {
          const booking = req.body;
          const result = await bookingCollection.insertOne(booking);
          res.status(201).json({ insertedId: result.insertedId });
        } catch (error) {
          console.error("Booking error:", error);
          res.status(500).json({ error: "Failed to book flight" });
        }
      });


         app.get('/bookings', async (req, res) => {
            const email = req.params.email;
            // const query = { userEmail: email };
            const result = await bookingCollection.find({ userEmail: email }).toArray();
            res.send(result);
        });


      

  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
  }
}

run().catch(err => console.error(" Run Error:", err));

app.get('/', (req, res) => {
  res.send('✈️ Airline Reservation System Running...');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
