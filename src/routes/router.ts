/**
 * ルーター
 */
import * as express from 'express';

import authentication from '../middlewares/authentication';

import accountsRouter from './accounts';
import authRouter from './auth';
import dashboardRouter from './dashboard';
import eventsRouter from './events';
import homeRouter from './home';
import invoicesRouter from './invoices';
import ordersRouter from './orders';
import movieTicketPaymentMethodRouter from './paymentMethods/movieTicket';
import pecorinoRouter from './pecorino';
import peopleRouter from './people';
import sellersRouter from './sellers';
import tasksRouter from './tasks';
import transactionsRouter from './transactions';
import userPoolsRouter from './userPools';
import waiterRouter from './waiter';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use(authRouter);

router.use(authentication);
router.use(homeRouter);
router.use('/accounts', accountsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/events', eventsRouter);
router.use('/invoices', invoicesRouter);
router.use('/orders', ordersRouter);
router.use('/paymentMethods/movieTicket', movieTicketPaymentMethodRouter);
router.use('/pecorino', pecorinoRouter);
router.use('/people', peopleRouter);
router.use('/sellers', sellersRouter);
router.use('/tasks', tasksRouter);
router.use('/transactions', transactionsRouter);
router.use('/userPools', userPoolsRouter);
router.use('/waiter', waiterRouter);

export default router;
