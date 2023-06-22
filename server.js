const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const dataProcessor = require('./dataProcessor')

require('dotenv').config();
const port = 8000;

const app = express();

const dbUrl = process.env.MONGO_URI;
const dbClient = new MongoClient(dbUrl);
let conn;
let db;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

(async ()=> {
    conn = await dbClient.connect(dbUrl);
    db = conn.db("1st");
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/userEvents/:userId', async(req, res) => {
  const userId = req.params.userId;
  const usersData = await dataProcessor();

  let collection = await db.collection("users_revenue");

  for (const [key, value] of usersData) {
    const dbUser = await collection.findOne({user_id: key});
    if (dbUser){
      const update = { $inc: { revenue: value.revenue } };
      await collection.updateOne({user_id: key}, update);
    }else {
      await collection.insertOne({user_id: key, revenue: value.revenue});
    }
  }


  const currUser = await collection.findOne({user_id: userId});
  console.log('user data:', currUser);
  res.send(currUser).status(200);

});

app.post("/liveEvent", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.send('very bad request').status(400);
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (!token == 'secret') {
    res.send('Access denied').status(409);
  }
  console.log('Authorization Token:', token);
  
  console.log('recieved', req.body);
  const jsonData = JSON.stringify(req.body) + '\n';

  // Append the data to the JSON file
  const writeStream = fs.createWriteStream('data.jsonl', { flags: 'a' });
  writeStream.write(jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing data to file:', err);
      return res.status(500).json({ error: 'Failed to write data to file' });
    }

    console.log('Data appended to file:', req.body);
  });

  res.send('done').status(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
