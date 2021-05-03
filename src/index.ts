import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Welcome to loatr.tech');
});

app.get('/ktv', (req, res) => {
  res.send('ktv api works');
});

app.listen(port, () => {
  console.log(`Load succeed on port ${port}`);
});