/**
 * 取引ルーター
 */
import * as express from 'express';

import moneyTransferTransactionsRouter from './transactions/moneyTransfer';
import placeOrderTransactionsRouter from './transactions/placeOrder';
import returnOrderTransactionsRouter from './transactions/returnOrder';

const transactionsRouter = express.Router();
transactionsRouter.use('/moneyTransfer', moneyTransferTransactionsRouter);
transactionsRouter.use('/placeOrder', placeOrderTransactionsRouter);
transactionsRouter.use('/returnOrder', returnOrderTransactionsRouter);
export default transactionsRouter;
