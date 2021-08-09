import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

export default async function connect() {
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
