import { Express, Request, Response } from 'express';
import { Filter, FindOptions, Db, ObjectId } from 'mongodb';
import { authenticateToken } from './middleware';

export default async function groupApi(app: Express, db: Db) {
  /**
   * Endpoints
   */
  app.get('/budget/group/:groupId', authenticateToken, getGroup);
  app.post('/budget/group', authenticateToken, createGroup);

  const groupCollections = db.collection('group');
  const userCollections = db.collection('user');

  async function getGroup(req: Request, res: Response) {
    const { groupId } = req.params;
    const post: any = await groupCollections.findOne({
      _id: new ObjectId(groupId),
    });

    // Send to the client side
    res.send(
      JSON.stringify({
        id: post._id,
        name: post.name,
        createdAt: post.createdAt,
      })
    );
  }

  async function createGroup(req: Request, res: Response) {
    const { name } = req.body;
    const { user } = req;
    if (name && user) {
      const groupObject = {
        name,
        createdBy: user.id,
        createdAt: new Date(),
        members: [user.id],
      };
      const resultsAfterInsert = await groupCollections.insertOne(groupObject);
      const groupId = resultsAfterInsert.insertedId.toHexString();
      await userCollections.updateOne(
        { _id: new ObjectId(user.id) },
        {
          $push: { groups: groupId },
        }
      );
      res.send(JSON.stringify({ groupId }));
    } else {
      res.status(400).send('Missing required fields');
    }
  }
}
