const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const keys = require('./config/keys');
const bodyParser = require('body-parser');
const randomstring = require('randomstring');
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
    lockSecret: randomstring.generate(5),
  });

  try {
    await lock.save();
    res.send(lock);
  } catch (err) {
    res.status(422).send(err);
  }
});

client.on('connect', function() {
  app.post('/api/locks/command', (req, res) => {
    const { userId, lockId, command } = req.body;

    if (!userId || !lockId || userId.trim() === '' || lockId.trim() === '') {
      res
        .status(400)
        .send('Invalid body, please provide a lock ID and an user ID.');
      return;
    }

    Lock.findById(lockId, (err, lock) => {
      if (err) {
        res.status(400).send(err);
        return;
      }

      if (lock.ownerId !== userId) {
        res.status(403).send('Access denied');
        return;
      }
      const topic = `${lock.lockSecret}/command`;
      client.publish(topic, command, () => {
        res.status(200).send('Command was published successfully');
      });
    });
  });
});

app.get('', (req, res) => {
  res.send('Success!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
