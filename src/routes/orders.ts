/**
 * 注文ルーター
 */
import * as cinerinoapi from '@cinerino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

const debug = createDebug('cinerino-console:routes');
const ordersRouter = express.Router();
/**
 * 注文検索
 */
ordersRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({});

            const orderStatusChoices = [
                cinerinoapi.factory.orderStatus.OrderDelivered,
                cinerinoapi.factory.orderStatus.OrderPickupAvailable,
                cinerinoapi.factory.orderStatus.OrderProcessing,
                cinerinoapi.factory.orderStatus.OrderReturned
            ];
            const searchConditions: cinerinoapi.factory.order.ISearchConditions = {
                sellerIds: (req.query.sellerIds !== undefined)
                    ? req.query.sellerIds
                    : searchMovieTheatersResult.data.map((m) => m.id),
                customerMembershipNumbers: (req.query.customerMembershipNumbers !== undefined && req.query.customerMembershipNumbers !== '')
                    ? (<string>req.query.customerMembershipNumbers).split(',').map((v) => v.trim())
                    : [],
                orderNumbers: (req.query.orderNumbers !== undefined && req.query.orderNumbers !== '')
                    ? (<string>req.query.orderNumbers).split(',').map((v) => v.trim())
                    : [],
                orderStatuses: (req.query.orderStatuses !== undefined)
                    ? req.query.orderStatuses
                    : orderStatusChoices,
                orderDateFrom: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                    ? moment(req.query.orderDateRange.split(' - ')[0]).toDate()
                    : moment().add(-1, 'day').toDate(),
                orderDateThrough: (req.query.orderDateRange !== undefined && req.query.orderDateRange !== '')
                    ? moment(req.query.orderDateRange.split(' - ')[1]).toDate()
                    : new Date(),
                confirmationNumbers: (req.query.confirmationNumbers !== undefined && req.query.confirmationNumbers !== '')
                    ? (<string>req.query.confirmationNumbers).split(',').map((v) => v.trim())
                    : []
            };

            debug('searching orders...', searchConditions);
            const searchOrdersResult = await orderService.search(searchConditions);
            debug(searchOrdersResult.totalCount, 'orders found.');
            res.render('orders/index', {
                moment: moment,
                movieTheaters: searchMovieTheatersResult.data,
                searchConditions: searchConditions,
                orders: searchOrdersResult.data,
                orderStatusChoices: orderStatusChoices
            });
        } catch (error) {
            next(error);
        }
    });
/**
 * 注文詳細
 */
ordersRouter.get(
    '/:orderNumber',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchOrdersResult = await orderService.search({
                orderNumbers: [req.params.orderNumber],
                orderDateFrom: moment('2017-04-20T00:00:00+09:00').toDate(),
                orderDateThrough: new Date()
            });
            const order = searchOrdersResult.data.shift();
            if (order === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Order');
            }
            res.render('orders/show', {
                moment: moment,
                order: order
            });
        } catch (error) {
            next(error);
        }
    });
export default ordersRouter;
