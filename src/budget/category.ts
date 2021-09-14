import { Express, Request, Response } from 'express';
import { Filter, FindOptions, Db, ObjectId } from 'mongodb';
import { authenticateToken } from './middleware';

export default async function categoryApi(app: Express, db: Db) {
  /**
   * Endpoints
   */
  app.get('/budget/categories', authenticateToken, getCategories);
  app.post('/budget/category', authenticateToken, createCategory);

  const categoryCollections = db.collection('category');

  async function getCategories(req: Request, res: Response) {
    const { group_id } = req.query;
    if (group_id) {
      // Find top categories under given group
      const topCategories: any = await categoryCollections
        .find({
          group_id,
          is_top_category: true,
        })
        .toArray();
      const allCategories: any[] = [];
      // Find all the sub-categories under current top category
      for (let i = 0; i < topCategories.length; i++) {
        const topCategory = topCategories[i];
        const categories: any = await categoryCollections
          .find({
            group_id,
            parent_category: topCategory._id.toHexString(),
          })
          .toArray();
        allCategories.push({
          id: topCategory._id,
          name: topCategory.name,
          categories: categories.map((category: any) => {
            return {
              id: category._id,
              name: category.name,
              show_notes: category.showNotes,
            };
          }),
        });
      }

      // Send to the client side
      res.send(JSON.stringify(allCategories));
    } else {
      res.status(400).send('Missing group id');
    }
  }

  async function createCategory(req: Request, res: Response) {
    const { name, group_id, parent_category, is_top_category } = req.body;
    const { user } = req;
    if (name && group_id && user) {
      const categoryObject = {
        name,
        group_id,
        is_top_category,
        parent_category,
        createdBy: user.id,
        createdAt: new Date(),
      };
      const resultsAfterInsert = await categoryCollections.insertOne(
        categoryObject
      );
      res.status(201).send(resultsAfterInsert);
    } else {
      res.status(400).send('Missing required fields');
    }
  }
}
