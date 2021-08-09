import { Express, Request, Response } from 'express';
import { FindOptions, MongoClient, ObjectId } from 'mongodb';
import connect from './connection';


export default async function lifeApi(app: Express) {
  const client: MongoClient = await connect();

  app.get('/life/posts', async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const postCollections = client.db('shangan').collection('post');
    // Get total count
    const totalCount = await postCollections.countDocuments();
    // Find documents
    const findOptions = { limit, sort: { createdAt: -1 } } as FindOptions<any>;
    const postsCursor = postCollections.find({}, findOptions);
    const posts = (await postsCursor.toArray()).map(post => {
      return {
        id: post._id,
        title: post.title,
        content: post.content,
      }
    });

    // Send to the client side
    res.send(
      JSON.stringify({
        items: posts,
        count: totalCount,
        limit,
      })
    );
  });

  app.get('/life/post/:postId', async (req: Request, res: Response) => {
    const { postId } = req.params;
    const postCollections = client.db('shangan').collection('post');
    const post: any = await postCollections.findOne({ _id: new ObjectId(postId) });

    // Send to the client side
    res.send(
      JSON.stringify({
        id: post._id,
        title: post.title,
        content: post.content,
      })
    );
  });

  app.post('/life/post', async (req: Request, res: Response) => {
    const postCollections = client.db('shangan').collection('post');

    const postObject = {
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date(),
      views: 0,
      likes: 0,
      comments: 0,
    };
    const resultsAfterInsert = await postCollections.insertOne(postObject);
    res.send(JSON.stringify(resultsAfterInsert));
  });
}