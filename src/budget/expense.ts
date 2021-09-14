import { Express, Request, Response } from 'express';
import { Filter, FindOptions, Db, ObjectId } from 'mongodb';
import { authenticateToken } from './middleware';

export default async function expenseApi(app: Express, db: Db) {
  /**
   * Endpoints
   */
  app.get('/budget/expenses', authenticateToken, getExpenses);
  app.post('/budget/expense', authenticateToken, createExpense);

  const expenseCollections = db.collection('expense');

  async function getExpenses(req: Request, res: Response) {
    const { group_id, year, month } = req.query;
    const { user } = req;
    if (group_id) {
      // Find top categories under given group
      const expenses: any = await expenseCollections
        .find({
          group_id,
          createdBy: user.id,
          'datetime.year': parseInt(year as string),
          'datetime.month': parseInt(month as string),
        })
        .toArray();

      // Group by category
      const groupedExpense: any = {};
      expenses.forEach((expense: any) => {
        if (groupedExpense[expense.category] === undefined) {
          groupedExpense[expense.category] = { amount: 0, items: [] };
        }
        groupedExpense[expense.category].amount += expense.amount;
        groupedExpense[expense.category].items.push({
          amount: expense.amount,
          notes: expense.notes,
        });
      });

      // Send to the client side
      res.send(JSON.stringify(groupedExpense));
    } else {
      res.status(400).send('Missing group id');
    }
  }

  async function createExpense(req: Request, res: Response) {
    const {
      category,
      datetime,
      notes,
      amount,
      group_id
    } = req.body;
    const { user } = req;
    if (category && group_id && datetime && amount && user) {
      const categoryObject = {
        category,
        datetime,
        notes,
        amount,
        group_id,
        createdBy: user.id,
        createdAt: new Date(),
      };
      const resultsAfterInsert = await expenseCollections.insertOne(
        categoryObject
      );
      res.status(201).send(resultsAfterInsert);
    } else {
      res.status(400).send('Missing required fields');
    }
  }
}
