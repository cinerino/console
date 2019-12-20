/**
 * プロジェクトルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

import accountsRouter from './accounts';
import actionsRouter from './actions';
import applicationsRouter from './applications';
import authorizationsRouter from './authorizations';
import dashboardRouter from './dashboard';
import eventsRouter from './events';
import iamRouter from './iam';
import invoicesRouter from './invoices';
import ordersRouter from './orders';
import ownershipInfosRouter from './ownershipInfos';
import movieTicketPaymentMethodRouter from './paymentMethods/movieTicket';
import peopleRouter from './people';
import programMembershipsRouter from './programMemberships';
import reservationsRouter from './reservations';
import resourcesRouter from './resources';
import sellersRouter from './sellers';
import tasksRouter from './tasks';
import transactionsRouter from './transactions';
import userPoolsRouter from './userPools';
import waiterRouter from './waiter';

const projects: any[] = (process.env.PROJECTS !== undefined) ? JSON.parse(process.env.PROJECTS) : [];

const projectsRouter = express.Router();

projectsRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            const message: string = '';
            const projectFromEnvironment = projects.find((p) => p.id === req.params.id);
            if (typeof projectFromEnvironment.settings.API_ENDPOINT !== 'string') {
                projectFromEnvironment.settings.API_ENDPOINT = process.env.API_ENDPOINT;
            }

            const projectService = new cinerinoapi.service.Project({
                endpoint: projectFromEnvironment.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: projectFromEnvironment.id });

            req.project = { ...project, settings: { ...project.settings, ...projectFromEnvironment.settings } };

            res.render('projects/edit', {
                message: message,
                project: req.project
            });
        } catch (error) {
            next(error);
        }
    }
);

projectsRouter.all(
    '/:id/*',
    async (req, _, next) => {
        // ルーティングからプロジェクトをセット
        const projectFromEnvironment = projects.find((p) => p.id === req.params.id);
        if (typeof projectFromEnvironment.settings.API_ENDPOINT !== 'string') {
            projectFromEnvironment.settings.API_ENDPOINT = process.env.API_ENDPOINT;
        }

        req.project = projectFromEnvironment;

        next();
    }
);

projectsRouter.get(
    '/:id/logo',
    async (req, res) => {
        let logo = 'https://s3-ap-northeast-1.amazonaws.com/cinerino/logos/cinerino.png';

        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            if (typeof project.logo === 'string') {
                logo = project.logo;
            }
        } catch (error) {
            console.error(error);
        }

        res.redirect(logo);
    }
);

projectsRouter.use('/:id/accounts', accountsRouter);
projectsRouter.use('/:id/actions', actionsRouter);
projectsRouter.use('/:id/applications', applicationsRouter);
projectsRouter.use('/:id/authorizations', authorizationsRouter);
projectsRouter.use('/:id/dashboard', dashboardRouter);
projectsRouter.use('/:id/events', eventsRouter);
projectsRouter.use('/:id/iam', iamRouter);
projectsRouter.use('/:id/invoices', invoicesRouter);
projectsRouter.use('/:id/orders', ordersRouter);
projectsRouter.use('/:id/ownershipInfos', ownershipInfosRouter);
projectsRouter.use('/:id/paymentMethods/movieTicket', movieTicketPaymentMethodRouter);
projectsRouter.use('/:id/people', peopleRouter);
projectsRouter.use('/:id/programMemberships', programMembershipsRouter);
projectsRouter.use('/:id/reservations', reservationsRouter);
projectsRouter.use('/:id/resources', resourcesRouter);
projectsRouter.use('/:id/sellers', sellersRouter);
projectsRouter.use('/:id/tasks', tasksRouter);
projectsRouter.use('/:id/transactions', transactionsRouter);
projectsRouter.use('/:id/userPools', userPoolsRouter);
projectsRouter.use('/:id/waiter', waiterRouter);

export default projectsRouter;
