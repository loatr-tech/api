import { Express, Request, Response } from 'express';
import { ObjectId, Db } from 'mongodb';

export default async function lifeCommentsApi(app: Express, db: Db) {
  const threadCollection = db.collection('thread');

  app.get('/life/post/:postId/comments', async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    // Find threads
    const threadsCursor = threadCollection.find({ post_id: postId });
    // Get total count of threads in current post
    const numOfThreads = await threadsCursor.count();
    // Apply filter to get paginated results
    threadsCursor
      .sort('createdAt', 1)
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    const threads = (await threadsCursor.toArray()).map((thread) => {
      return {
        id: thread._id,
        post_id: thread.post_id,
        comment: thread.comment,
        likes: thread.likes,
        dislikes: thread.dislikes,
        owner: thread.owner,
        replies: thread.replies,
        createdAt: thread.createdAt,
      };
    });

    res.send({
      threads,
      count: numOfThreads,
    });
  });

  app.get('/life/post/:postId/comment/:threadId', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    if (threadId) {
      const thread: any = await threadCollection.findOne({
        _id: new ObjectId(threadId),
      });
      res.send({
        id: thread._id,
        post_id: thread.post_id,
        comment: thread.comment,
        likes: thread.likes,
        dislikes: thread.dislikes,
        owner: thread.owner,
        replies: thread.replies,
        createdAt: thread.createdAt,
      });
    }
  });

  app.post('/life/post/comment', async (req: Request, res: Response) => {
    const { post_id, comment, owner_id } = req.body;
    if (post_id && owner_id) {
      const owner: any = await db
        .collection('user')
        .findOne({ _id: new ObjectId(owner_id) });
      if (owner) {
        const resultsAfterInsert = await threadCollection.insertOne({
          post_id,
          comment,
          likes: 0,
          dislikes: 0,
          owner: {
            id: owner._id,
            name: owner.name,
            avatar_url: owner.avatar_url,
          },
          interacted_users: {},
          createdAt: new Date(),
          replies: 0,
        });
        // Update comments count on the post
        await db
          .collection('post')
          .updateOne({ _id: new ObjectId(post_id) }, { $inc: { comments: 1 } });
        res.send(JSON.stringify(resultsAfterInsert));
      } else {
        res.status(400).send('Cannot find the author, owner_id is not valid');
      }
    } else {
      res.status(400).send('Missing required fields');
    }
  });

  app.post(
    '/life/post/comment/:threadId/interact',
    async (req: Request, res: Response) => {
      const { threadId } = req.params;
      const { like, dislike, user_id } = req.body;
      if (user_id && (like || dislike)) {
        const { interacted_users = {} }: any = await threadCollection.findOne({
          _id: new ObjectId(threadId),
        });
        let likesAndDislikes = [0, 0];
        if (interacted_users[user_id] === (like ? 1 : -1)) {
          delete interacted_users[user_id];
          likesAndDislikes = like ? [-1, 0] : [0, -1];
        } else {
          if (interacted_users[user_id]) {
            likesAndDislikes = like ? [1, -1] : [-1, 1];
          } else {
            likesAndDislikes = like ? [1, 0] : [0, 1];
          }
          interacted_users[user_id] = like ? 1 : -1;
        }
        const [likes, dislikes] = likesAndDislikes;
        await threadCollection.updateOne(
          { _id: new ObjectId(threadId) },
          {
            $set: { interacted_users },
            $inc: { likes, dislikes },
          }
        );
        const updatedComment: any = await threadCollection.findOne({
          _id: new ObjectId(threadId),
        });
        res.status(200).send({
          likes: updatedComment.likes,
          dislikes: updatedComment.dislikes,
        });
      } else {
        res.status(400).send('Missing required fields');
      }
    }
  );
}
