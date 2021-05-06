import express, { Express } from 'express';
import cors from 'cors';
import ktvApi from './ktv/ktv';

const app: Express = express();
const port = process.env.PORT || 8080;

// CORS-enabled for all origins!
app.use(cors());

ktvApi(app);

app.get('/', (req, res) => {
  res.send('Welcome to loatr.tech');
});

app.listen(port, () => {
  console.log(`Load succeed on port ${port}`);
});