/**
 * アプリケーションルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const applicationsRouter = express.Router();

/**
 * アプリケーション検索
 */
applicationsRouter.get(
    '',
    async (req, res, next) => {
        try {
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const searchConditions: any = {
                limit: req.query.limit,
                page: req.query.page,
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                const searchApplicationsResult = await iamService.fetch({
                    uri: '/applications',
                    method: 'GET',
                    // tslint:disable-next-line:no-magic-numbers
                    expectedStatusCodes: [200],
                    qs: searchConditions
                })
                    .then(async (response) => {
                        return {
                            totalCount: Number(<string>response.headers.get('X-Total-Count')),
                            data: await response.json()
                        };
                    });

                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchApplicationsResult.totalCount,
                    recordsFiltered: searchApplicationsResult.totalCount,
                    data: searchApplicationsResult.data
                });
            } else {
                res.render('applications/index', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * アプリケーション詳細
 */
applicationsRouter.get(
    '/:id',
    async (req, res, next) => {
        try {
            const iamService = new cinerinoapi.service.IAM({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const projectService = new cinerinoapi.service.Project({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            const project = await projectService.findById({ id: req.project.id });
            if (project.settings === undefined || project.settings.cognito === undefined) {
                throw new Error('Project settings undefined');
            }

            const customerUserPoolId = project.settings.cognito.customerUserPool.id;
            const adminUserPoolId = project.settings.cognito.adminUserPool.id;

            // IAMメンバー検索
            const member = await iamService.findMemberById({
                member: { id: req.params.id }
            });

            // Cognitoユーザープール検索
            let userPoolClient: cinerinoapi.factory.cognito.UserPoolClientType;
            try {
                userPoolClient = await userPoolService.findClientById({
                    userPoolId: customerUserPoolId,
                    clientId: req.params.id
                });
            } catch (error) {
                userPoolClient = await userPoolService.findClientById({
                    userPoolId: adminUserPoolId,
                    clientId: req.params.id
                });
            }

            res.render('applications/show', {
                moment: moment,
                application: member.member,
                userPoolClient: userPoolClient
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * アプリケーションの注文検索
 */
applicationsRouter.get(
    '/:id/orders',
    async (req, res, next) => {
        try {
            const now = new Date();

            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment(now)
                    .add(-1, 'day')
                    .toDate(),
                orderDateThrough: now,
                customer: {
                    identifiers: [
                        {
                            name: 'clientId',
                            value: req.params.id
                        }
                    ]
                }
            });
            debug(searchOrdersResult.totalCount, 'orders found.');
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);

export default applicationsRouter;
