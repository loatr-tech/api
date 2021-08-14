import { Express } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import lifePostApi from './post';
import lifeCommentsApi from './comments';

dotenv.config();

async function connect() {
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
  const client: MongoClient = await connect();
  
  lifePostApi(app, client);
  lifeCommentsApi(app, client);
}
