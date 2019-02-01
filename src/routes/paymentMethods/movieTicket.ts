/**
 * ムビチケ決済方法ルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';

import * as cinerinoapi from '../../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const movieTicketPaymentMethodRouter = express.Router();

/**
 * 検索
 */
movieTicketPaymentMethodRouter.get(
    '',
    async (req, res, next) => {
        try {
            const paymentMethodService = new cinerinoapi.service.PaymentMethod({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions:
                cinerinoapi.factory.paymentMethod.ISearchConditions<cinerinoapi.factory.paymentMethodType.MovieTicket> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { identifier: cinerinoapi.factory.sortType.Ascending },
                identifiers: (req.query.identifiers !== undefined && req.query.identifiers !== '')
                    ? (<string>req.query.identifiers).split(',')
                        .map((v) => v.trim())
                    : undefined,
                serviceTypes: (req.query.serviceTypes !== undefined && req.query.serviceTypes !== '')
                    ? (<string>req.query.serviceTypes).split(',')
                        .map((v) => v.trim())
                    : undefined
            };

            if (req.query.format === 'datatable') {
                const { totalCount, data } = await paymentMethodService.searchMovieTickets(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: totalCount,
                    recordsFiltered: totalCount,
                    data: data
                });
            } else {
                res.render('paymentMethods/movieTicket', {
                    searchConditions: searchConditions
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケ詳細
 */
movieTicketPaymentMethodRouter.get(
    '/:identifier',
    async (req, res, next) => {
        try {
            const message = undefined;

            const paymentMethodService = new cinerinoapi.service.PaymentMethod({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchResult = await paymentMethodService.searchMovieTickets({
                limit: 1,
                identifiers: [req.params.identifier]
            });
            const movieTicket = searchResult.data.shift();
            if (movieTicket === undefined) {
                throw new cinerinoapi.factory.errors.NotFound('Movie Ticket');
            }

            res.render('paymentMethods/movieTicket/show', {
                message: message,
                movieTicket: movieTicket,
                PaymentMethodType: cinerinoapi.factory.paymentMethodType,
                PlaceType: cinerinoapi.factory.placeType
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * ムビチケの注文検索
 */
movieTicketPaymentMethodRouter.get(
    '/:identifier/orders',
    async (req, res, next) => {
        try {
            const orderService = new cinerinoapi.service.Order({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchResult = await orderService.search({
                limit: req.query.limit,
                page: req.query.page,
                sort: { orderDate: cinerinoapi.factory.sortType.Descending },
                paymentMethods: {
                    typeOfs: [cinerinoapi.factory.paymentMethodType.MovieTicket],
                    paymentMethodIds: [req.params.identifier]
                }
            });
            res.json(searchResult);
        } catch (error) {
            next(error);
        }
    }
);

export default movieTicketPaymentMethodRouter;
