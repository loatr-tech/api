import { Express, Request, Response } from 'express';
import { FindOptions, MongoClient } from 'mongodb';
import connect from './connection';


export default async function lifeApi(app: Express) {
  const client: MongoClient = await connect();

  app.get('/life/posts', async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const postCollections = client.db('shangan').collection('post');
    // Get total count
    const totalCount = await postCollections.countDocuments();
    // Find documents
    const findOptions = { limit } as FindOptions<any>;
    const postsCursor = postCollections.find({}, findOptions);
    const posts = await postsCursor.toArray();

    // Send to the client side
    res.send(
      JSON.stringify({
        items: posts,
        count: totalCount,
        limit,
      })
    );
  });

  app.post('/life/post', async (req: Request, res: Response) => {
    const postCollections = client.db('shangan').collection('post');

    const postObject = {
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date(),
    };
    const resultsAfterInsert = await postCollections.insertOne(postObject);
    res.send(JSON.stringify(resultsAfterInsert));
  });
}
