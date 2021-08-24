import { Express, Request, Response } from 'express';
import { Filter, FindOptions, Db, ObjectId } from 'mongodb';
import { Post } from './models';

export default async function postsApi(app: Express, db: Db) {
  /**
   * Endpoints
   */
  app.get('/life/posts', getPosts);
  app.get('/life/post/:postId', getPost);
  app.post('/life/post', createPost);

  const postCollections = db.collection('post');

  async function getPosts(req: Request, res: Response) {
    const { limit = 10, category } = req.query;
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
        category: post.category,
        createdAt: post.createdAt,
        owner: post.owner,
        interactions: post.interactions,
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
  }

  async function getPost(req: Request, res: Response) {
    const { postId } = req.params;
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
        meta_data: post.meta_data,
        interactions: post.interactions,
        tags: post.tags,
      })
    );
  }

  async function createPost(req: Request, res: Response) {
    const { title, content, category, owner_id } = req.body;
    if (title && content && category && owner_id) {
      const owner: any = await db
        .collection('user')
        .findOne({ _id: new ObjectId(owner_id) });
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
          interactions: {
            views: 0,
            likes: 0,
            comments: 0,
          },
          tags: [],
        };
        const resultsAfterInsert = await postCollections.insertOne(postObject);
        res.send(JSON.stringify(resultsAfterInsert));
      } else {
        res.status(400).send('Cannot find the author, owner_id is not valid');
      }
    } else {
      res.status(400).send('Missing required fields');
    }
  }
}
