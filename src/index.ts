import express, { Express } from 'express';
import cors from 'cors';
import ktvApi from './ktv/ktv';
import lifeApi from './life';

const app: Express = express();
const port = process.env.PORT || 8080;

// CORS-enabled for whitelist routes
app.use(
  cors({
    origin: [
      'http://localhost:3210',
      'https://life.loatr.tech',
    ],
  })
);
// Body parser
app.use(express.urlencoded({ extended: true }));
// Allow our application to accept json when doing POST request
app.use(express.json());

ktvApi(app);
lifeApi(app);

app.get('/', (req, res) => {
  res.send('Welcome to loatr.tech');
});

app.listen(port, () => {
  console.log(`Load succeed on port ${port}`);
});