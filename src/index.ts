import express, { Express } from 'express';
import cors from 'cors';
import ktvApi from './ktv/ktv';
import lifeApi from './life/life';

const app: Express = express();
const port = process.env.PORT || 8080;

// CORS-enabled for all origins!
app.use(cors());
// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

ktvApi(app);
lifeApi(app);

app.get('/', (req, res) => {
  res.send('Welcome to loatr.tech');
});

app.listen(port, () => {
  console.log(`Load succeed on port ${port}`);
});