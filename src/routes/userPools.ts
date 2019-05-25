/**
 * ユーザープールルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

const debug = createDebug('cinerino-console:routes');
const userPoolsRouter = express.Router();
/**
 * ユーザープール検索
 */
userPoolsRouter.get(
    '',
    // tslint:disable-next-line:cyclomatic-complexity
    // tslint:disable-next-line:cyclomatic-complexity max-func-body-length
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            if (req.query.format === 'datatable') {
                const userPools = (req.project.settings.cognito !== undefined) ? [
                    {
                        id: req.project.settings.cognito.customerUserPool.id,
                        name: 'Customerユーザープール'
                    },
                    {
                        id: req.project.settings.cognito.adminUserPool.id,
                        name: 'Adminユーザープール'
                    }
                ] : [];
                res.json({
                    draw: req.query.draw,
                    recordsTotal: userPools.length,
                    recordsFiltered: userPools.length,
                    data: userPools
                });
            } else {
                res.render('userPools/index', {
                    moment: moment
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

userPoolsRouter.get(
    '/:userPoolId',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const userPool = await userPoolService.findById({
                userPoolId: req.params.userPoolId
            });
            const searchUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: req.params.userPoolId });
            res.render('userPools/show', {
                moment: moment,
                userPool: userPool,
                userPoolClients: searchUserPoolClientsResult.data
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ユーザープールの注文検索
 */
userPoolsRouter.get(
    '/:userPoolId/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment()
                    .add(-1, 'day')
                    .toDate(),
                orderDateThrough: new Date(),
                customer: {
                    identifiers: [
                        {
                            name: 'tokenIssuer',
                            value: `https://cognito-idp.ap-northeast-1.amazonaws.com/${req.params.userPoolId}`
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

userPoolsRouter.get(
    '/:userPoolId/clients/:clientId',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const userPoolClient = await userPoolService.findClientById({
                userPoolId: req.params.userPoolId,
                clientId: req.params.clientId
            });
            res.render('userPools/clients/show', {
                moment: moment,
                userPoolClient: userPoolClient
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * クライアントの注文検索
 */
userPoolsRouter.get(
    '/:userPoolId/clients/:clientId/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment()
                    .add(-1, 'day')
                    .toDate(),
                orderDateThrough: new Date(),
                customer: {
                    identifiers: [
                        {
                            name: 'clientId',
                            value: req.params.clientId
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

userPoolsRouter.get(
    '/:userPoolId/people/:id',
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {
            if (req.project.settings.cognito !== undefined) {
                switch (req.params.userPoolId) {
                    case req.project.settings.cognito.customerUserPool.id:
                        res.redirect(`/projects/${req.project.id}/people/${req.params.id}`);
                        break;
                    case req.project.settings.cognito.adminUserPool.id:
                        res.redirect(`/projects/${req.project.id}/iam/users/${req.params.id}`);
                        break;
                    default:
                        throw new Error('Unknown userPool');
                }
            } else {
                throw new Error('Unknown userPool');
            }
        } catch (error) {
            next(error);
        }
    }
);

export default userPoolsRouter;
