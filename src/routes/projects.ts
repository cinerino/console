/**
 * プロジェクトルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

import accountsRouter from './accounts';
import authorizationsRouter from './authorizations';
import dashboardRouter from './dashboard';
import eventsRouter from './events';
import iamRouter from './iam';
import invoicesRouter from './invoices';
import ordersRouter from './orders';
import ownershipInfosRouter from './ownershipInfos';
import movieTicketPaymentMethodRouter from './paymentMethods/movieTicket';
import pecorinoRouter from './pecorino';
import peopleRouter from './people';
import reservationsRouter from './reservations';
import sellersRouter from './sellers';
import tasksRouter from './tasks';
import transactionsRouter from './transactions';
import userPoolsRouter from './userPools';
import waiterRouter from './waiter';

const projectsRouter = express.Router();

projectsRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            const message: string = '';
            const projectService = new cinerinoapi.service.Project({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            res.render('projects/edit', {
                message: message,
                project: project
            });
        } catch (error) {
            next(error);
        }
    }
);

projectsRouter.use('/:id/accounts', accountsRouter);
projectsRouter.use('/:id/authorizations', authorizationsRouter);
projectsRouter.use('/:id/dashboard', dashboardRouter);
projectsRouter.use('/:id/events', eventsRouter);
projectsRouter.use('/:id/iam', iamRouter);
projectsRouter.use('/:id/invoices', invoicesRouter);
projectsRouter.use('/:id/orders', ordersRouter);
projectsRouter.use('/:id/ownershipInfos', ownershipInfosRouter);
projectsRouter.use('/:id/paymentMethods/movieTicket', movieTicketPaymentMethodRouter);
projectsRouter.use('/:id/pecorino', pecorinoRouter);
projectsRouter.use('/:id/people', peopleRouter);
projectsRouter.use('/:id/reservations', reservationsRouter);
projectsRouter.use('/:id/sellers', sellersRouter);
projectsRouter.use('/:id/tasks', tasksRouter);
projectsRouter.use('/:id/transactions', transactionsRouter);
projectsRouter.use('/:id/userPools', userPoolsRouter);
projectsRouter.use('/:id/waiter', waiterRouter);

export default projectsRouter;
