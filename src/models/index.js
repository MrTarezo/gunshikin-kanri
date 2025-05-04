// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Expense, Receipt } = initSchema(schema);

export {
  Expense,
  Receipt
};