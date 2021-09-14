import { Express } from 'express';
import { Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import authApi from './auth';
import userApi from './user';
import groupApi from './group';
import categoryApi from './category';

dotenv.config();

async function _connect() {
  const {
    BUDGET_DB_USERNAME,
    BUDGET_DB_PASSWORD,
    BUDGET_DB_CLUSTER,
    BUDGET_DB_DATABASE,
  } = process.env;

  const uri = `mongodb+srv://${BUDGET_DB_USERNAME}:${BUDGET_DB_PASSWORD}@${BUDGET_DB_CLUSTER}/${BUDGET_DB_DATABASE}?retryWrites=true&w=majority`;

  const mongoClient = new MongoClient(uri);

  await mongoClient.connect();

  return mongoClient;
}

export default async function budgetApi(app: Express) {
  const client: MongoClient = await _connect();
  const db: Db = client.db('shangan');

  authApi(app, db);
  userApi(app, db);
  groupApi(app, db);
  categoryApi(app, db);
}
