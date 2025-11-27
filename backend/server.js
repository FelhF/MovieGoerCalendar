require('dotenv').config();
const express = require('express');
const cors = require('cors');
const eventsRoute = require('./routes/EventsRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/events', eventsRoute);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
