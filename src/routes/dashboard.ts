/**
 * ダッシュボードルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const dashboardRouter = express.Router();
dashboardRouter.get(
    '/countNewOrder',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
                limit: 1,
                page: 1,
                orderDateFrom: moment().add(-1, 'day').toDate(),
                orderDateThrough: moment().toDate()
            };
            const searchResult = await orderService.search(searchConditions);
            res.json({
                totalCount: searchResult.totalCount
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
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment().add(-1, 'day').toDate(),
                startThrough: moment().toDate()
            };
            const searchResult = await placeOrderService.search(searchConditions);
            searchConditions.statuses = [
                cinerinoapi.factory.transactionStatusType.Canceled,
                cinerinoapi.factory.transactionStatusType.Expired
            ];
            const searchExitResult = await placeOrderService.search(searchConditions);
            res.json({
                // tslint:disable-next-line:no-magic-numbers
                rate: Math.floor(searchExitResult.totalCount / searchResult.totalCount * 100)
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
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                limit: 1,
                page: 1,
                startFrom: moment().add(-1, 'day').toDate(),
                startThrough: moment().toDate()
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
export default dashboardRouter;
