/**
 * ユーザープールルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

// import * as ssktsapi from '../ssktsapi';

// const debug = createDebug('cinerino-console:routes');
const userPoolsRouter = express.Router();
userPoolsRouter.get(
    '/:userPoolId',
    // tslint:disable-next-line:max-func-body-length
    async (_, res, next) => {
        try {
            // const userPoolService = new ssktsapi.service.UserPool({
            //     endpoint: <string>process.env.API_ENDPOINT,
            //     auth: req.user.authClient
            // });
            // const userPool = await userPoolService.findById({
            //     userPoolId: req.params.userPoolId
            // });
            // const searchUserPoolClientsResult = await userPoolService.searchClients({ userPoolId: req.params.userPoolId });
            res.render('userPools/show', {
                moment: moment,
                userPool: {},
                userPoolClients: []
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
    async (_, res, next) => {
        try {
            // const orderService = new ssktsapi.service.Order({
            //     endpoint: <string>process.env.API_ENDPOINT,
            //     auth: req.user.authClient
            // });
            // const searchOrdersResult = await orderService.search({
            //     limit: req.query.limit,
            //     page: req.query.page,
            //     sort: { orderDate: ssktsapi.factory.sortType.Descending },
            //     orderDateFrom: moment().add(-1, 'months').toDate(),
            //     orderDateThrough: new Date(),
            //     customer: {
            //         typeOf: ssktsapi.factory.personType.Person,
            //         identifiers: [
            //             {
            //                 name: 'tokenIssuer',
            //                 value: `https://cognito-idp.ap-northeast-1.amazonaws.com/${req.params.userPoolId}`
            //             }
            //         ]
            //     }
            // });
            // debug(searchOrdersResult.totalCount, 'orders found.');
            const searchOrdersResult = { totalCount: 0, data: [] };
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);
userPoolsRouter.get(
    '/:userPoolId/clients/:clientId',
    // tslint:disable-next-line:max-func-body-length
    async (_, res, next) => {
        try {
            // const userPoolService = new ssktsapi.service.UserPool({
            //     endpoint: <string>process.env.API_ENDPOINT,
            //     auth: req.user.authClient
            // });
            // const userPoolClient = await userPoolService.findClientById({
            //     userPoolId: req.params.userPoolId,
            //     clientId: req.params.clientId
            // });
            res.render('userPools/clients/show', {
                moment: moment,
                userPoolClient: {}
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
    async (_, res, next) => {
        try {
            // const orderService = new ssktsapi.service.Order({
            //     endpoint: <string>process.env.API_ENDPOINT,
            //     auth: req.user.authClient
            // });
            // const searchOrdersResult = await orderService.search({
            //     limit: req.query.limit,
            //     page: req.query.page,
            //     sort: { orderDate: ssktsapi.factory.sortType.Descending },
            //     orderDateFrom: moment().add(-1, 'months').toDate(),
            //     orderDateThrough: new Date(),
            //     customer: {
            //         typeOf: ssktsapi.factory.personType.Person,
            //         identifiers: [
            //             {
            //                 name: 'clientId',
            //                 value: req.params.clientId
            //             }
            //         ]
            //     }
            // });
            // debug(searchOrdersResult.totalCount, 'orders found.');
            const searchOrdersResult = { totalCount: 0, data: [] };
            res.json(searchOrdersResult);
        } catch (error) {
            next(error);
        }
    }
);
export default userPoolsRouter;
