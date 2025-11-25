let express = require("express");
let cors = require("cors");
let { MongoClient } = require("mongodb");
let app = express();
let port = process.env.port || 3000;
let router = express.Router();

// MongoDB connection string - update this with your MongoDB URI
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "school";
const collectionName = "students";

let db;
let students;

// Connect to MongoDB
MongoClient.connect(mongoURI)
    .then(client => {
        console.log("Connected to MongoDB");
        db = client.db(dbName);
         students = db.collection(collectionName);
        
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
app.use('/api/student', router);

// Get all students
router.get('/', async (req, res) => {
    try {
        const studentsList = await students.find({}).toArray();
        res.json(studentsList);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send('Error fetching students');
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const student = await students.findOne({ id: id });
        if (student) {
            res.json(student);
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).send('Error fetching student');
    }
});