/**
 * ダッシュボードルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import * as moment from 'moment-timezone';

import * as cinerinoapi from '../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const dashboardRouter = express.Router();

dashboardRouter.get(
    '',
    async (req, res, next) => {
        try {
            const userPoolService = new cinerinoapi.service.UserPool({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const sellerService = new cinerinoapi.service.Seller({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });

            let userPool: cinerinoapi.factory.cognito.UserPoolType | undefined;
            let userPoolClients: cinerinoapi.factory.cognito.UserPoolClientListType = [];
            let adminUserPool: cinerinoapi.factory.cognito.UserPoolType | undefined;
            let adminUserPoolClients: cinerinoapi.factory.cognito.UserPoolClientListType = [];

            try {
                if (req.project.settings.cognito !== undefined) {
                    userPool = await userPoolService.findById({
                        userPoolId: req.project.settings.cognito.customerUserPool.id
                    });

                    const searchUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: <string>userPool.Id });
                    userPoolClients = searchUserPoolClientsResult.data;

                    adminUserPool = await userPoolService.findById({
                        userPoolId: req.project.settings.cognito.adminUserPool.id
                    });

                    const searchAdminUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: <string>adminUserPool.Id });
                    adminUserPoolClients = searchAdminUserPoolClientsResult.data;
                }
            } catch (error) {
                // no op
            }

            const searchSellersResult = await sellerService.search({});

            res.render('index', {
                message: 'Welcome to Cinerino Console!',
                userPool: userPool,
                userPoolClients: userPoolClients,
                adminUserPool: adminUserPool,
                adminUserPoolClients: adminUserPoolClients,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType,
                sellers: searchSellersResult.data
            });
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/countNewOrder',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
                limit: 1,
                page: 1,
                orderDateFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            };
            const { totalCount } = await orderService.search(searchConditions);
            res.json({
                totalCount: totalCount
            });
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/aggregateExitRate',
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            };
            const searchResult = await placeOrderService.search(searchConditions);
            searchConditions.statuses = [
                cinerinoapi.factory.transactionStatusType.Canceled,
                cinerinoapi.factory.transactionStatusType.Expired
            ];
            const searchExitResult = await placeOrderService.search(searchConditions);
            res.json({
                rate: (searchResult.totalCount > 0)
                    // tslint:disable-next-line:no-magic-numbers
                    ? Math.floor(searchExitResult.totalCount / searchResult.totalCount * 100)
                    : 0
            });
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/countNewUser',
    async (_, res, next) => {
        try {
            // 未実装

            res.json({
                totalCount: 0
            });
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/countNewTransaction',
    async (req, res, next) => {
        try {
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment()
                    .tz('Asia/Tokyo')
                    .startOf('day')
                    .toDate()
            };
            const searchResult = await placeOrderService.search(searchConditions);
            res.json({
                totalCount: searchResult.totalCount
            });
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: (req.query.sort !== undefined) ? req.query.sort : { orderDate: cinerinoapi.factory.sortType.Descending },
                orderDateFrom: moment(req.query.orderDateFrom)
                    .toDate(),
                orderDateThrough: moment(req.query.orderDateThrough)
                    .toDate()
            });
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);

dashboardRouter.get(
    '/dbStats',
    async (req, res) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const stats = await eventService.fetch({
                uri: '/stats/dbStats',
                method: 'GET',
                // tslint:disable-next-line:no-magic-numbers
                expectedStatusCodes: [200]
            })
                .then(async (response) => {
                    return response.json();
                });

            res.json(stats);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

dashboardRouter.get(
    '/health',
    async (req, res) => {
        try {
            const eventService = new cinerinoapi.service.Event({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const stats = await eventService.fetch({
                uri: '/health',
                method: 'GET',
                // tslint:disable-next-line:no-magic-numbers
                expectedStatusCodes: [200]
            })
                .then(async (response) => {
                    const version = response.headers.get('X-API-Version');

                    return {
                        version: version,
                        status: response.status
                    };
                });

            res.json(stats);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

dashboardRouter.get(
    '/queueCount',
    async (req, res) => {
        try {
            const taskService = new cinerinoapi.service.Task({
                endpoint: req.project.settings.API_ENDPOINT,
                auth: req.user.authClient
            });
            const result = await taskService.search({
                limit: 1,
                runsFrom: moment()
                    .add(-1, 'day')
                    .toDate(),
                runsThrough: moment()
                    .toDate(),
                statuses: [cinerinoapi.factory.taskStatus.Ready]
            });

            res.json(result);
        } catch (error) {
            res.status(INTERNAL_SERVER_ERROR)
                .json({
                    error: { message: error.message }
                });
        }
    }
);

export default dashboardRouter;
