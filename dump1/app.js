let express = require("express");
let cors = require("cors");
let { MongoClient } = require("mongodb");
let app = express();
let port = process.env.port || 3000;
let router = express.Router();

// MongoDB connection string - update this with your MongoDB URI
const mongoURI = "mongodb://localhost:27017";
const dbName = "citizens";
const collectionName = "citizens";

let db;
let citizens;

// Connect to MongoDB
MongoClient.connect(mongoURI)
    .then(client => {
        console.log("Connected to MongoDB");
    db = client.db(dbName);
    // Initialize the citizens collection reference once after connecting
    citizens = db.collection(collectionName);
        
        // Start server after MongoDB connection
        app.listen(port, () => {
            console.log("Listening on port " + port);
        });
    })
    .catch(error => {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/citizens', router);

// Get all citizens
router.get('/', async (req, res) => {
    try {
        const citizensList = await citizens.find({}).toArray();
        res.json(citizensList);
    } catch (error) {
        console.error("Error fetching citizens:", error);
        res.status(500).send('Error fetching citizens');
    }
});

// Get citizen by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const citizen = await citizens.findOne({ id: id });
        if (citizen) {
            res.json(citizen);
        } else {
            res.status(404).send('Citizen not found');
        }
    } catch (error) {
        console.error("Error fetching citizen:", error);
        res.status(500).send('Error fetching citizen');
    }
});

// Register a new citizen
app.post('/api/citizens/register', async (req, res) => {
    try {
        const payload = req.body || {};

        // Basic required fields check (FirstName, LastName, DoB)
        if (!payload.FirstName || !payload.LastName || !payload.DoB) {
            return res.status(400).json({ error: 'Missing required fields: FirstName, LastName, DoB' });
        }

        // Generate a simple NID for the demo if not provided
        if (!payload.NID) {
            payload.NID = 'NID' + Date.now().toString().slice(-8);
        }

        payload.createdAt = new Date();

        // Ensure citizens collection exists
        if (!citizens) citizens = db.collection('citizens');

        const result = await citizens.insertOne(payload);
        res.json({ success: true, nid: payload.NID, id: result.insertedId });
    } catch (error) {
        console.error('Error registering citizen:', error);
        res.status(500).json({ error: 'Error registering citizen' });
    }
});

// Simple login endpoint (lookup by NID)
app.post('/api/login', async (req, res) => {
    try {
        const { nid, NID, password } = req.body || {};
        const lookup = nid || NID;
        if (!lookup) return res.status(400).json({ error: 'Missing nid' });

        if (!citizens) citizens = db.collection('citizens');

        const user = await citizens.findOne({ $or: [{ NID: lookup }, { nid: lookup }] });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // NOTE: Password check is not implemented here because the registration form
        // does not include a password field. For production, store and verify hashed
        // passwords. This endpoint simply returns the user document on match.
        // Remove sensitive fields before returning if necessary.

        // Exclude internal MongoDB fields if desired
        const { _id, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login error' });
    }
});