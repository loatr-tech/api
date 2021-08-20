import { Express } from 'express';
import { Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import lifeAuthApi from './auth';
import lifePostApi from './post';
import lifeCommentsApi from './comments';
import lifeRepliesApi from './replies';

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
  
  lifeAuthApi(app, db);
  lifePostApi(app, db);
  lifeCommentsApi(app, db);
  lifeRepliesApi(app, db);
}
