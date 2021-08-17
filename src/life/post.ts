import { Express, Request, Response } from 'express';
import { Filter, FindOptions, MongoClient, ObjectId } from 'mongodb';

export default async function lifePostApi(app: Express, client: MongoClient) {

  app.get('/life/posts', async (req: Request, res: Response) => {
    const { limit = 10, category } = req.query;
    const postCollections = client.db('shangan').collection('post');
    // Get total count
    const totalCount = await postCollections.countDocuments();
    // Find documents
    const findFilter = {} as Filter<any>;
    if (category) findFilter.category = category;
    const findOptions = { limit, sort: { createdAt: -1 } } as FindOptions<any>;
    const postsCursor = postCollections.find(findFilter, findOptions);
    const posts = (await postsCursor.toArray()).map((post) => {
      return {
        id: post._id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        owner: post.owner,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
      };
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
    const post: any = await postCollections.findOne({
      _id: new ObjectId(postId),
    });

    // Send to the client side
    res.send(
      JSON.stringify({
        id: post._id,
        title: post.title,
        content: post.content,
        category: post.category,
        createdAt: post.createdAt,
        owner: post.owner,
        views: post.views,
        likes: post.likes,
        comments: post.comments,
      })
    );
  });

  app.post('/life/post', async (req: Request, res: Response) => {
    const postCollections = client.db('shangan').collection('post');
    const { title, content, category, owner_id } = req.body;
    if (title && content && category && owner_id) {
      const owner: any = await client.db('shangan').collection('user').findOne({ _id: new ObjectId(owner_id) });
      if (owner) {
        const postObject = {
          title,
          content,
          category,
          owner: {
            id: owner._id,
            name: owner.name,
            avatar_url: owner.avatar_url,
          },
          createdAt: new Date(),
          views: 0,
          likes: 0,
          comments: 0,
        };
        const resultsAfterInsert = await postCollections.insertOne(postObject);
        res.send(JSON.stringify(resultsAfterInsert));
      } else {
        res.status(400).send('Cannot find the author, owner_id is not valid');
      }
    } else {
      res.status(400).send('Missing required fields');
    }
  });
}
