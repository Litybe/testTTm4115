const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const keys = require('./config/keys');
const bodyParser = require('body-parser');
require('./models/Lock');

mongoose.connect(keys.mongoURI);
const Lock = mongoose.model('locks');

const app = express();

app.use(bodyParser.json());

var client = mqtt.connect(keys.mqttURI);

app.post('/api/locks', async (req, res) => {
  const { name, ownerId } = req.body;

  if (!name || !ownerId || name.trim() === '' || ownerId.trim() === '') {
    res
      .status(400)
      .send('Invalid body, please provide a lock name and an owner ID.');
    return;
  }

  const lock = new Lock({
    name,
    ownerId,
  });

  try {
    await lock.save();

    res.send(lock);
  } catch (err) {
    res.status(422).send(err);
  }
});

app.get('', (req, res) => {
  res.send('Success!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
