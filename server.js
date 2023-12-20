const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const PORT = process.env.PORT || 3001; // Fallback to 3001 if process.env.PORT is not defined


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://https://process-js.netlify.app/' // Replace with your frontend's URL
}));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri)
let db;

const siteUrl = "https://process-js.netlify.app";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
async function run() {
    try {
        await client.connect();
        db = client.db("process_sketches");
        console.log("Successfully connected to MongoDB!");
        app.listen(3001, () => console.log(`Server running on ${PORT}`));
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}
run().catch(console.error);

//
// API Endpoints
app.post('/save', async (req, res) => {
    try {
        const sketch = req.body;
        const result = await db.collection('sketches').insertOne(sketch);
        const uniqueId = result.insertedId;
        const uniqueUrl = `${req.protocol}://${siteUrl}/sketch/${uniqueId}`;
        res.json({ uniqueId, uniqueUrl });
    } catch (error) {
        res.status(500).send(error);
    }
});
const { ObjectId } = require('mongodb');

app.get('/sketch/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(404).send('Invalid ID format');
        }

        const sketch = await db.collection('sketches').findOne({ _id: new ObjectId(id) });
        if (sketch) {
            res.json(sketch);
        } else {
            res.status(404).send('Sketch not found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/test', (req, res) => {
    res.send('Server is running');
});