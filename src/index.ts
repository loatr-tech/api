import express, { Express } from 'express';
import cors from 'cors';
import ktvApi from './ktv/ktv';
import lifeApi from './life';
import budgetApi from './budget';
const cookieParser = require('cookie-parser');

const app: Express = express();
const port = process.env.PORT || 8080;

// CORS-enabled for whitelist routes
app.use(
  cors({
    origin: [
      'http://localhost:3210',
      'http://localhost:1234',
      'https://life.loatr.tech',
      'https://budget.loatr.tech',
      'https://ktv.loatr.tech',
    ],
    credentials: true,
  })
);

// Body parser
app.use(express.urlencoded({ extended: true }));
// Allow our application to accept json when doing POST request
app.use(express.json());
app.use(cookieParser());

ktvApi(app);
lifeApi(app);
budgetApi(app);

app.get('/', (req, res) => {
  res.send('Welcome to loatr.tech');
});

app.listen(port, () => {
  console.log(`Load succeed on port ${port}`);
});