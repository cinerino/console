/**
 * 取引ルーター
 */
import * as express from 'express';

import placeOrderTransactionsRouter from './transactions/placeOrder';

const transactionsRouter = express.Router();
transactionsRouter.use('/placeOrder', placeOrderTransactionsRouter);
export default transactionsRouter;
