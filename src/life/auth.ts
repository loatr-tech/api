import { Express, Request, Response } from 'express';
import { ObjectId, MongoClient } from 'mongodb';

export default async function lifeAuthApi(app: Express, client: MongoClient) {
  app.post('/life/login', async (req: Request, res: Response) => {
    const { method, googleId, user } = req.body;
    if (method === 'google' && googleId && user) {
      const userCollection = client.db('shangan').collection('user');
      const existingUser: any = await userCollection.findOne({ googleId });
      if (existingUser) {
        console.log('existing user');
        res.send({
          id: existingUser._id,
          ...existingUser,
        });
      } else {
        const resultsAfterInsert = await userCollection.insertOne({
          googleId,
          name: user.name,
          email: user.email,
          avatar_url: user.imageUrl,
          createdAt: new Date(),
        });
        console.log('new user');
        const userObject: any = await userCollection.findOne({ _id: resultsAfterInsert.insertedId });
        res.send({
          id: userObject._id,
          ...userObject,
        });
      }
    } else {
      res.status(400).send('Missing required fields')
    }
  });
}
