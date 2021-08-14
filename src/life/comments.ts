import { Express, Request, Response } from 'express';
import { ObjectId, MongoClient } from 'mongodb';

export default async function lifeCommentsApi(app: Express, client: MongoClient) {

  app.get('/life/post/:postId/comments', async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    // Find threads
    const threadCollection = client.db('shangan').collection('thread');
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
    });;

    res.send({
      threads,
      count: numOfThreads,
    });
  });

  app.get('/life/post/:postId/comment/:threadId', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    if (threadId) {
      const threadCollection = client.db('shangan').collection('thread');
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
    const { post_id, comment, user_id } = req.body;
    if (post_id && user_id) {
      const threadCollection = client.db('shangan').collection('thread');
      const resultsAfterInsert = await threadCollection.insertOne({
        post_id,
        comment,
        likes: 0,
        dislikes: 0,
        user_id,
        createdAt: new Date(),
        replies: 0,
      });
      // Update comments count on the post
      await client
        .db('shangan')
        .collection('post')
        .updateOne({ _id: new ObjectId(post_id) }, { $inc: { comments: 1 } });
      res.send(JSON.stringify(resultsAfterInsert));
    }
  });

  app.get('/life/post/:postId/comment/:threadId/replies', async (req: Request, res: Response) => {
    const { threadId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    // Find replies
    const threadCollection = client.db('shangan').collection('reply');
    const repliesCursor = threadCollection.find({ thread_id: threadId });
    // Get total count of replies in current thread
    const numOfReplies = await repliesCursor.count();
    // Apply filter to get paginated results
    repliesCursor
      .sort('createdAt', 1)
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    const replies = (await repliesCursor.toArray()).map((reply) => {
      return {
        id: reply._id,
        reply: reply.reply,
        user_id: reply.user_id,
        quote: reply.quote,
        createdAt: reply.createdAt,
      };
    });

    res.send({
      replies,
      count: numOfReplies,
    });
  });

  app.post('/life/post/reply', async (req: Request, res: Response) => {
    const { post_id, thread_id, reply, user_id, quote } = req.body;
    if (post_id && thread_id && user_id) {
      const replyCollection = client.db('shangan').collection('reply');
      const resultsAfterInsert = await replyCollection.insertOne({
        post_id,
        thread_id,
        reply,
        user_id,
        quote,
        createdAt: new Date(),
      });

      // Update comments count on the post
      await client
        .db('shangan')
        .collection('post')
        .updateOne({ _id: new ObjectId(post_id) }, { $inc: { comments: 1 } });
      // Update relys count on the thread
      await client
        .db('shangan')
        .collection('thread')
        .updateOne({ _id: new ObjectId(thread_id) }, { $inc: { replies: 1 } });
      res.send(JSON.stringify(resultsAfterInsert));
    }
  });
}
