import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ObjectId, MongoClient, FindOptions } from 'mongodb';

export default async function lifeAuthApi(app: Express, client: MongoClient) {
  async function _getUserObj(filter = {}, userObject?: any) {
    if (!userObject) {
      const userCollection = client.db('shangan').collection('user');
      userObject = await userCollection.findOne(filter, {
        projection: { password: 0 },
      } as FindOptions);
    }
    return {
      id: userObject._id,
      name: userObject.name,
      username: userObject.username,
      email: userObject.email,
      googleId: userObject.googleId,
      avatar_url: userObject.avatar_url,
      createdAt: userObject.createdAt,
    };
  }

  /**
   * Endpoint to let user login with 3rd party integration
   */
  app.post('/life/login', async (req: Request, res: Response) => {
    const { method, googleId, user } = req.body;
    if (method === 'google' && googleId && user) {
      const userCollection = client.db('shangan').collection('user');
      const existingUser: any = await userCollection.findOne({ googleId });
      if (existingUser) {
        res.status(200).send(await _getUserObj({}, existingUser));
      } else {
        const { insertedId } = await userCollection.insertOne({
          googleId,
          name: user.name,
          email: user.email,
          avatar_url: user.imageUrl,
          createdAt: new Date(),
        });
        const userObject: any = await _getUserObj({ _id: insertedId });
        res.status(201).send(userObject);
      }
    } else {
      res.status(400).send('Missing required fields');
    }
  });

  /**
   * Endpoint to let user signup with: username, email and password
   */
  app.post('/life/signup', async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      // Create hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      const userCollection = client.db('shangan').collection('user');
      // Find existing user base on given email
      const existingUser: any = await userCollection.findOne({ email });

      if (existingUser) {
        // Have existing user registed use given email
        if (existingUser.username) {
          // Current user already registered
          res.status(409).send('该邮箱已被注册');
        } else {
          // TODO: email verification here
          // Update the user data with given username and password
          await userCollection.updateOne(
            { email },
            {
              $set: {
                username,
                password: hashedPassword,
              },
            }
          );
          // Return
          res.status(200).send(await _getUserObj({ _id: existingUser._id }));
        }
      } else {
        if (await userCollection.findOne({ username })) {
          // Current username already used
          res.status(409).send('该用户名已被注册');
        } else {
          // Create a new user
          const { insertedId } = await userCollection.insertOne({
            username,
            name: username,
            email,
            password: hashedPassword,
            avatar_url: null,
            createdAt: new Date(),
          });

          // Return
          res.status(201).send(await _getUserObj({ _id: insertedId }));
        }
      }
    } catch (err) {
      res.sendStatus(500);
    }
  });
}
