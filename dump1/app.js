let express = require("express");
let cors = require("cors");
let app = express();
let port = process.env.port || 3000;
let router = express.Router();

app.use(cors());
app.use('/api/student', router);
app.listen(port, () => {
    console.log("Listening on port " + port);
});


let students = [
    { id: 1, name: "John Doe", age: 22 },
    { id: 2, name: "Jane Smith", age: 20 },
    { id: 3, name: "Sam Brown", age: 23 }
];

router.get('/', (req, res) => {
    res.json(students);
});

router.get('/:id', (req, res) => {
    let student = students.find(s => s.id == req.params.id);
    if (student) {
        res.json(student);
    } else {
        res.status(404).send('Student not found');
    }
});