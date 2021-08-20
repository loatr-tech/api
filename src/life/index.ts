import { Express } from 'express';
import { Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import authApi from './auth';
import postsApi from './post';
import threadsApi from './threads';
import repliesApi from './replies';

dotenv.config();

async function _connect() {
  const {
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    MONGODB_CLUSTER,
    MONGODB_DATABASE,
  } = process.env;

  const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

  const mongoClient = new MongoClient(uri);

  await mongoClient.connect();

  return mongoClient;
}

export default async function lifeApi(app: Express) {
  const client: MongoClient = await _connect();
  const db: Db = client.db('shangan');
  
  authApi(app, db);
  postsApi(app, db);
  threadsApi(app, db);
  repliesApi(app, db);
}
