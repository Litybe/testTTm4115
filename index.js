const express = require('express');
const keys = require('./config/keys');

const app = express();

app.get('', (req, res) => {
  res.send('Success!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
