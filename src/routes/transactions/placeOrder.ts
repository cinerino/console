/**
 * 注文取引ルーター
 */
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as cinerinoapi from '../../cinerinoapi';
// import validator from '../../middlewares/validator';

const debug = createDebug('cinerino-console:routes');
const placeOrderTransactionsRouter = express.Router();
/**
 * 検索
 */
placeOrderTransactionsRouter.get(
    '',
    async (req, res, next) => {
        try {
            debug('req.query:', req.query);
            const placeOrderService = new cinerinoapi.service.transaction.PlaceOrder({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const organizationService = new cinerinoapi.service.Organization({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchMovieTheatersResult = await organizationService.searchMovieTheaters({});
            const transactionStatusChoices = [
                cinerinoapi.factory.transactionStatusType.Canceled,
                cinerinoapi.factory.transactionStatusType.Confirmed,
                cinerinoapi.factory.transactionStatusType.Expired,
                cinerinoapi.factory.transactionStatusType.InProgress
            ];
            const searchConditions: cinerinoapi.factory.transaction.ISearchConditions<cinerinoapi.factory.transactionType.PlaceOrder> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: cinerinoapi.factory.chevre.sortType.Descending },
                typeOf: cinerinoapi.factory.transactionType.PlaceOrder,
                ids: (Array.isArray(req.query.ids)) ? req.query.ids : undefined,
                statuses: (req.query.statuses !== undefined)
                    ? req.query.statuses
                    : transactionStatusChoices,
                startFrom: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[0]).toDate()
                    : moment().add(-1, 'week').toDate(),
                startThrough: (req.query.startRange !== undefined && req.query.startRange !== '')
                    ? moment(req.query.startRange.split(' - ')[1]).toDate()
                    : moment().add(1, 'day').toDate(),
                endFrom: (req.query.endFrom !== undefined) ? moment(req.query.endFrom).toDate() : undefined,
                endThrough: (req.query.endThrough !== undefined) ? moment(req.query.endThrough).toDate() : undefined,
                agent: {
                    ids: (req.query.agent !== undefined && req.query.agent.ids !== '')
                        ? (<string>req.query.agent.ids).split(',').map((v) => v.trim())
                        : []
                },
                seller: {
                    ids: (req.query.seller !== undefined && req.query.seller.ids !== undefined)
                        ? req.query.seller.ids
                        : searchMovieTheatersResult.data.map((m) => m.id)
                },
                object: {
                    customerContact: (req.query.object !== undefined
                        && req.query.object.customerContact !== undefined)
                        ? req.query.object.customerContact
                        : {}
                },
                result: {
                    order: {
                        orderNumbers: (req.query.result !== undefined
                            && req.query.result.order !== undefined
                            && req.query.result.order.orderNumbers !== '')
                            ? (<string>req.query.result.order.orderNumbers).split(',').map((v) => v.trim())
                            : []
                    }
                }
            };
            if (req.query.format === 'datatable') {
                const searchScreeningEventsResult = await placeOrderService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: searchScreeningEventsResult.totalCount,
                    recordsFiltered: searchScreeningEventsResult.totalCount,
                    data: searchScreeningEventsResult.data
                });
            } else {
                res.render('transactions/placeOrder/index', {
                    moment: moment,
                    movieTheaters: searchMovieTheatersResult.data,
                    transactionStatusChoices: transactionStatusChoices,
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    });
export default placeOrderTransactionsRouter;
