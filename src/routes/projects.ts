/**
 * プロジェクトルーター
 */
import * as express from 'express';
import { NO_CONTENT } from 'http-status';

import * as cinerinoapi from '../cinerinoapi';

import accountsRouter from './accounts';
import actionsRouter from './actions';
import applicationsRouter from './applications';
import authorizationsRouter from './authorizations';
import eventsRouter from './events';
import homeRouter from './home';
import iamRouter from './iam';
import invoicesRouter from './invoices';
import ordersRouter from './orders';
import ownershipInfosRouter from './ownershipInfos';
import movieTicketPaymentMethodRouter from './paymentMethods/movieTicket';
import paymentServicesRouter from './paymentServices';
import peopleRouter from './people';
import productsRouter from './products';
import reservationsRouter from './reservations';
import resourcesRouter from './resources';
import sellersRouter from './sellers';
import serviceOutputsRouter from './serviceOutputs';
import tasksRouter from './tasks';
import transactionsRouter from './transactions';
import userPoolsRouter from './userPools';
import waiterRouter from './waiter';

const API_ENDPOINT = <string>process.env.API_ENDPOINT;

const projectsRouter = express.Router();

/**
 * プロジェクト作成
 */
projectsRouter.all(
    '/new',
    async (req, res, next) => {
        try {
            let message;
            let attributes: cinerinoapi.factory.project.IProject = {
                typeOf: cinerinoapi.factory.chevre.organizationType.Project,
                id: '',
                name: '新しいプロジェクト名称',
                parentOrganization: {
                    typeOf: cinerinoapi.factory.chevre.organizationType.Corporation,
                    name: { ja: '', en: '' }
                },
                // デフォルト設定をセット
                settings: {
                }
            };

            const projectService = new cinerinoapi.service.Project({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });

            if (req.method === 'POST') {
                try {
                    attributes = await createProjectFromBody({
                        req: req
                    });
                    const project = await projectService.create(attributes);
                    req.flash('message', 'プロジェクトを作成しました');
                    res.redirect(`/projects/${project.id}/home`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('projects/new', {
                layout: 'layouts/dashboard',
                message: message,
                attributes: attributes,
                OrganizationType: cinerinoapi.factory.chevre.organizationType
            });
        } catch (error) {
            next(error);
        }
    }
);

async function createProjectFromBody(params: {
    req: express.Request;
}): Promise<cinerinoapi.factory.project.IProject> {
    let informOrder: cinerinoapi.factory.project.IInformParams[] = [];
    if (Array.isArray(params.req.body.settings?.onOrderStatusChanged?.informOrder)) {
        informOrder = (<any[]>params.req.body.settings.onOrderStatusChanged.informOrder)
            .filter((recipient) => {
                return typeof recipient.name === 'string' && recipient.name.length > 0
                    && typeof recipient.url === 'string' && recipient.url.length > 0;
            })
            .map((recipient) => {
                return {
                    recipient: {
                        typeOf: 'WebAPI',
                        name: String(recipient.name),
                        url: String(recipient.url)
                    }
                };
            });
    }

    return {
        typeOf: cinerinoapi.factory.chevre.organizationType.Project,
        id: params.req.body.id,
        name: params.req.body.name,
        logo: params.req.body.logo,
        parentOrganization: params.req.body.parentOrganization,
        settings: {
            cognito: {
                customerUserPool: {
                    id: params.req.body.settings?.cognito?.customerUserPool?.id
                }
            },
            onOrderStatusChanged: {
                informOrder: informOrder
            },
            transactionWebhookUrl: params.req.body.settings?.transactionWebhookUrl,
            ...(typeof params.req.body.settings?.sendgridApiKey === 'string')
                ? { sendgridApiKey: params.req.body.settings.sendgridApiKey }
                : undefined
        }
    };
}

projectsRouter.all(
    '/:id',
    async (req, res, next) => {
        try {
            let message: string = '';

            const projectService = new cinerinoapi.service.Project({
                endpoint: API_ENDPOINT,
                auth: req.user.authClient
            });
            let project = await projectService.findById({ id: req.params.id });

            if (req.method === 'DELETE') {
                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    project = await createProjectFromBody({
                        req: req
                    });
                    await projectService.update(project);
                    req.flash('message', '更新しました');
                    res.redirect(req.originalUrl);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            req.project = { ...project, settings: { ...project.settings, id: project.id, API_ENDPOINT: API_ENDPOINT } };

            res.render('projects/edit', {
                message: message,
                project: project
            });
        } catch (error) {
            next(error);
        }
    }
);

projectsRouter.all(
    '/:id/*',
    async (req, _, next) => {
        req.project = {
            typeOf: cinerinoapi.factory.chevre.organizationType.Project,
            id: req.params.id,
            settings: { id: req.params.id, API_ENDPOINT: API_ENDPOINT }
        };

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
projectsRouter.use('/:id/events', eventsRouter);
projectsRouter.use('/:id/home', homeRouter);
projectsRouter.use('/:id/iam', iamRouter);
projectsRouter.use('/:id/invoices', invoicesRouter);
projectsRouter.use('/:id/orders', ordersRouter);
projectsRouter.use('/:id/ownershipInfos', ownershipInfosRouter);
projectsRouter.use('/:id/paymentMethods/movieTicket', movieTicketPaymentMethodRouter);
projectsRouter.use('/:id/paymentServices', paymentServicesRouter);
projectsRouter.use('/:id/people', peopleRouter);
projectsRouter.use('/:id/products', productsRouter);
projectsRouter.use('/:id/reservations', reservationsRouter);
projectsRouter.use('/:id/resources', resourcesRouter);
projectsRouter.use('/:id/sellers', sellersRouter);
projectsRouter.use('/:id/serviceOutputs', serviceOutputsRouter);
projectsRouter.use('/:id/tasks', tasksRouter);
projectsRouter.use('/:id/transactions', transactionsRouter);
projectsRouter.use('/:id/userPools', userPoolsRouter);
projectsRouter.use('/:id/waiter', waiterRouter);

export default projectsRouter;
